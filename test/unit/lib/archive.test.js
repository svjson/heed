import { test, expect } from '@playwright/test';

import { sanitizeFilename } from '../../../lib/archive.js';

test.describe('sanitizeFilename', () => {

  [
    ['Hodr @ Mimer 2025-06-16', 'hodr-at-mimer-2025-06-16'],
    ['/// Tarzan & Jürgén \\\\\\', 'tarzan-and-jurgen'],
    ['Node.js: The Good Parts', 'nodejs-the-good-parts'],
    ['Ümläüts and accents — déjà vu!', 'umlauts-and-accents-deja-vu'],
    ['The "one" and only?', 'the-one-and-only'],
    ['Project: 🚀 Launch @ Dawn!', 'project-x-launch-at-dawn'],
    ['hello/world\\back\\slash', 'helloworldbackslash'],
    ['📁 My *Important* Files.zip', 'x-my-important-fileszip'],
    ['T̸̤̖̠̠̠̍̐͌̈́̽̿̇̌͗͗̽̅̄̓̕͘̕͠e̷̢̡̛̖̞̲̼̲̖͎̯͖̻̋̾̂̽̋̓̍̈́̾̽̊̐͘͝s̸̢̯͓̖͉͙͉̜̜̺͔̖̙͔͛̈́̿̍̍͌̑̅̐̂́̎͒̅̓̄͌͘͝t̴̛̤̩̬̼̘̗̲̺̖͉̙̤̑̅̋͛͐͛̿̐̔͆̎͗̃̇̇͊̈́̇ͅ', 'test'],
    [' Apple Event: "One More Thing..."', 'x-apple-event-one-more-thing'],
    ['dot.dot.dot...file', 'dotdotdotfile'],
    ['en–dash—and—em—dash', 'en-dash-and-em-dash'],
    ['   lots    of     spaces   ', 'lots-of-spaces'],
    ['weird_chars_*&^%$#@!+=[]{}|;:<>,.?`~', 'weird-chars-and-at'],
    ['NERD  ICONS', 'nerd-xxxxx-icons'],
    ['Filename with trailing space ', 'filename-with-trailing-space'],
    ['   .hiddenfile   ', 'hiddenfile'],
    ['multilingual 漢字 русский язык عربى', 'multilingual-han-zi-russkii-iazyk-rb']
  ].forEach(([input, expected]) => {
    test(`${input} --> ${expected}`, () => {
      expect(sanitizeFilename(input)).toBe(expected);
    });
  });


});
