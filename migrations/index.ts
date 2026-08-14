import * as migration_20260813_200358_fix_form_and_video_playback from './20260813_200358_fix_form_and_video_playback';
import * as migration_20260813_202700_add_background_video_playback from './20260813_202700_add_background_video_playback';
import * as migration_20260814_064456_art_hur_about_and_contact from './20260814_064456_art_hur_about_and_contact';

export const migrations = [
  {
    up: migration_20260813_200358_fix_form_and_video_playback.up,
    down: migration_20260813_200358_fix_form_and_video_playback.down,
    name: '20260813_200358_fix_form_and_video_playback',
  },
  {
    up: migration_20260813_202700_add_background_video_playback.up,
    down: migration_20260813_202700_add_background_video_playback.down,
    name: '20260813_202700_add_background_video_playback',
  },
  {
    up: migration_20260814_064456_art_hur_about_and_contact.up,
    down: migration_20260814_064456_art_hur_about_and_contact.down,
    name: '20260814_064456_art_hur_about_and_contact',
  },
];
