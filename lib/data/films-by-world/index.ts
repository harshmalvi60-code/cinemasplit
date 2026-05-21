import { FilmIndex } from '../../types';

// ── Batch 1 & 2 (original 10 per emotion) ──────────────────────────────────
import {
  healing_heartbreak,
  healing_numbness,
  loneliness_quiet,
  loneliness_invisible,
  identity_unknown,
  social_anxiety,
  self_worth,
} from './batch1';

import {
  purpose_lost,
  existential_meaning,
  grief_living,
  inner_peace,
  spiritual_awakening,
  hope_light,
  emotional_growth,
} from './batch2';

// ── Batch 3 (15 extra for first 9 emotions) ──────────────────────────────────
import {
  healing_heartbreak_extra,
  healing_numbness_extra,
  loneliness_quiet_extra,
  loneliness_invisible_extra,
  identity_unknown_extra,
  social_anxiety_extra,
  self_worth_extra,
  purpose_lost_extra,
  existential_meaning_extra,
} from './batch3';

// ── Batch 4 (15 extra for last 5 emotions) ──────────────────────────────────
import {
  grief_living_extra,
  inner_peace_extra,
  spiritual_awakening_extra,
  hope_light_extra,
  emotional_growth_extra,
} from './batch4';

// ── New worlds: Obsession + Burnout ─────────────────────────────────────────
import {
  obsession_destructive,
  obsession_creative,
  burnout_empty,
  burnout_compassion,
} from './new-worlds';

export const films: FilmIndex = {
  'healing/heartbreak-recovery':
    [...healing_heartbreak, ...healing_heartbreak_extra],

  'healing/emotional-numbness':
    [...healing_numbness, ...healing_numbness_extra],

  'loneliness/quiet-isolation':
    [...loneliness_quiet, ...loneliness_quiet_extra],

  'loneliness/feeling-invisible':
    [...loneliness_invisible, ...loneliness_invisible_extra],

  'identity-crisis/not-knowing-yourself':
    [...identity_unknown, ...identity_unknown_extra],

  'social-anxiety/fear-of-connection':
    [...social_anxiety, ...social_anxiety_extra],

  'self-worth/not-enough':
    [...self_worth, ...self_worth_extra],

  'purpose-and-direction/feeling-lost-in-life':
    [...purpose_lost, ...purpose_lost_extra],

  'existential-confusion/meaning-of-life':
    [...existential_meaning, ...existential_meaning_extra],

  'grief/learning-to-live-again':
    [...grief_living, ...grief_living_extra],

  'inner-peace/slowing-down':
    [...inner_peace, ...inner_peace_extra],

  'spiritual-awakening/beyond-ego':
    [...spiritual_awakening, ...spiritual_awakening_extra],

  'hope/light-after-darkness':
    [...hope_light, ...hope_light_extra],

  'emotional-growth/becoming':
    [...emotional_growth, ...emotional_growth_extra],

  // New worlds
  'obsession/destructive-love':
    [...obsession_destructive],

  'obsession/creative-obsession':
    [...obsession_creative],

  'burnout/empty-achievement':
    [...burnout_empty],

  'burnout/compassion-fatigue':
    [...burnout_compassion],
};
