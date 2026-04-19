const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const EditorProfile = require('../models/EditorProfile');
const HiringRequest = require('../models/HiringRequest');
const Review = require('../models/Review');

// ── AI Editor Matching ──────────────────────────────────────
// POST /api/ai/match-editors
router.post('/match-editors', auth, async (req, res) => {
  try {
    const {
      projectType, style, budget,
      deadline, skills, description
    } = req.body;

    // Fetch all available editors
    const editors = await EditorProfile.find({ availability: true })
      .populate('user', 'name email avatar');

    const reviews = await Review.find();

    // Scoring algorithm
    const scored = editors.map(editor => {
      let score = 0;
      const reasons = [];

      // Skill match (40 points)
      const skillMatches = skills?.filter(s =>
        editor.skills.includes(s)
      ).length || 0;
      const skillScore = Math.round(
        (skillMatches / (skills?.length || 1)) * 40
      );
      score += skillScore;
      if (skillMatches > 0) {
        reasons.push(`Matches ${skillMatches} of your required skills`);
      }

      // Budget match (20 points)
      if (budget && editor.price <= budget) {
        const budgetScore = Math.round(
          ((budget - editor.price) / budget) * 20
        );
        score += budgetScore;
        reasons.push(`Within your budget at $${editor.price}`);
      }

      // Rating score (20 points)
      const ratingScore = Math.round((editor.averageRating / 5) * 20);
      score += ratingScore;
      if (editor.averageRating >= 4.5) {
        reasons.push(`Highly rated at ${editor.averageRating}★`);
      }

      // Experience score (10 points)
      const expScore = Math.min(editor.experience, 10);
      score += expScore;
      if (editor.experience >= 5) {
        reasons.push(`${editor.experience} years of experience`);
      }

      // Completed projects (10 points)
      const projectScore = Math.min(
        Math.round(editor.completedProjects / 10), 10
      );
      score += projectScore;
      if (editor.completedProjects >= 20) {
        reasons.push(`${editor.completedProjects} projects completed`);
      }

      // Style matching bonus
      if (style && editor.bio?.toLowerCase()
        .includes(style.toLowerCase())) {
        score += 5;
        reasons.push(`Specializes in ${style} style`);
      }

      return {
        editor,
        score: Math.min(score, 100),
        matchPercentage: Math.min(score, 100),
        reasons
      };
    });

    // Sort by score
    const results = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    res.json({
      matches: results,
      totalAnalyzed: editors.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Video Quality Scoring ───────────────────────────────────
// POST /api/ai/score-video
router.post('/score-video', auth, async (req, res) => {
  try {
    const {
      title, duration, fileSize,
      resolution, hasColorGrading,
      hasSoundDesign, hasMotionGraphics,
      editorId
    } = req.body;

    let scores = {
      technical: 0,
      creativity: 0,
      storytelling: 0,
      production: 0
    };
    const feedback = [];

    // Technical score (25 points)
    if (resolution === '4K') {
      scores.technical += 25;
      feedback.push('✅ 4K resolution — excellent quality');
    } else if (resolution === '1080p') {
      scores.technical += 18;
      feedback.push('✅ 1080p resolution — good quality');
    } else if (resolution === '720p') {
      scores.technical += 10;
      feedback.push('⚠️ 720p resolution — consider upgrading');
    } else {
      scores.technical += 5;
      feedback.push('❌ Low resolution detected');
    }

    // File size vs duration ratio
    if (duration > 0) {
      const mbPerMinute = (fileSize / (1024 * 1024)) / (duration / 60);
      if (mbPerMinute > 50) {
        scores.technical += 10;
        feedback.push('✅ High bitrate — great visual quality');
      } else if (mbPerMinute > 20) {
        scores.technical += 6;
        feedback.push('✅ Good bitrate');
      } else {
        scores.technical += 2;
        feedback.push('⚠️ Low bitrate may affect quality');
      }
    }

    // Color grading (25 points)
    if (hasColorGrading) {
      scores.creativity += 25;
      feedback.push('✅ Color grading detected — professional look');
    } else {
      scores.creativity += 10;
      feedback.push('⚠️ No color grading — add for professional finish');
    }

    // Sound design (25 points)
    if (hasSoundDesign) {
      scores.storytelling += 25;
      feedback.push('✅ Sound design present — enhances viewer experience');
    } else {
      scores.storytelling += 8;
      feedback.push('⚠️ Sound design missing — critical for engagement');
    }

    // Motion graphics (25 points)
    if (hasMotionGraphics) {
      scores.production += 25;
      feedback.push('✅ Motion graphics — adds production value');
    } else {
      scores.production += 12;
      feedback.push('💡 Motion graphics could improve engagement');
    }

    const totalScore = Math.round(
      (scores.technical + scores.creativity +
       scores.storytelling + scores.production) / 4
    );

    let grade = 'F';
    if (totalScore >= 90) grade = 'A+';
    else if (totalScore >= 80) grade = 'A';
    else if (totalScore >= 70) grade = 'B+';
    else if (totalScore >= 60) grade = 'B';
    else if (totalScore >= 50) grade = 'C';
    else if (totalScore >= 40) grade = 'D';

    res.json({
      totalScore,
      grade,
      scores,
      feedback,
      recommendation: totalScore >= 70
        ? 'This video meets professional standards'
        : 'Improvements needed for professional quality'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Smart Pricing ───────────────────────────────────────────
// POST /api/ai/smart-pricing
router.post('/smart-pricing', auth, async (req, res) => {
  try {
    const {
      skills, experience, completedProjects,
      averageRating, location, pricingType
    } = req.body;

    let basePrice = 50;
    const breakdown = [];

    // Skills premium
    const premiumSkills = [
      'motion-graphics', 'animation', 'color-grading'
    ];
    const standardSkills = [
      'video-editing', 'photo-editing', 'thumbnail-design'
    ];

    const premiumCount = skills?.filter(s =>
      premiumSkills.includes(s)
    ).length || 0;
    const standardCount = skills?.filter(s =>
      standardSkills.includes(s)
    ).length || 0;

    const skillBonus = (premiumCount * 20) + (standardCount * 10);
    basePrice += skillBonus;
    breakdown.push({
      factor: 'Skills',
      impact: `+$${skillBonus}`,
      note: `${premiumCount} premium + ${standardCount} standard skills`
    });

    // Experience multiplier
    const expBonus = Math.min(experience * 8, 80);
    basePrice += expBonus;
    breakdown.push({
      factor: 'Experience',
      impact: `+$${expBonus}`,
      note: `${experience} years in the industry`
    });

    // Rating premium
    if (averageRating >= 4.8) {
      basePrice += 40;
      breakdown.push({
        factor: 'Top Rated',
        impact: '+$40',
        note: 'Elite rating badge (4.8+ stars)'
      });
    } else if (averageRating >= 4.5) {
      basePrice += 25;
      breakdown.push({
        factor: 'High Rating',
        impact: '+$25',
        note: 'Excellent rating (4.5+ stars)'
      });
    } else if (averageRating >= 4.0) {
      basePrice += 10;
      breakdown.push({
        factor: 'Good Rating',
        impact: '+$10',
        note: 'Good rating (4.0+ stars)'
      });
    }

    // Project history
    const projectBonus = Math.min(
      Math.round(completedProjects * 0.5), 30
    );
    basePrice += projectBonus;
    breakdown.push({
      factor: 'Track Record',
      impact: `+$${projectBonus}`,
      note: `${completedProjects} completed projects`
    });

    // Location adjustment
    const locationMultipliers = {
      'US': 1.3, 'UK': 1.2, 'Canada': 1.15,
      'Australia': 1.1, 'India': 0.7, 'Remote': 1.0
    };
    const locationKey = Object.keys(locationMultipliers)
      .find(k => location?.includes(k)) || 'Remote';
    const multiplier = locationMultipliers[locationKey];
    const beforeLocation = basePrice;
    basePrice = Math.round(basePrice * multiplier);
    const locationImpact = basePrice - beforeLocation;
    breakdown.push({
      factor: 'Location',
      impact: `${locationImpact >= 0 ? '+' : ''}$${locationImpact}`,
      note: `${locationKey} market rates`
    });

    // Market comparison
    const marketAvg = 150;
    const suggested = {
      minimum: Math.round(basePrice * 0.85),
      recommended: basePrice,
      premium: Math.round(basePrice * 1.2)
    };

    res.json({
      suggested,
      breakdown,
      marketAverage: marketAvg,
      competitiveness: basePrice < marketAvg
        ? 'Below Market — Consider raising rates'
        : basePrice > marketAvg * 1.5
          ? 'Premium Tier — Justify with portfolio'
          : 'Competitive — Good market position',
      pricingType
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;