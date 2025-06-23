// @ts-check
import { test, expect } from '@playwright/test';

import { expandBlockReference, extractGroups } from '../../../../lib/macro/reveal-fm-macro.js';

test.describe('Frontmatter %reveal-macro', () => {
  test.describe('expandBlockReference()', () => {

    const slideIrDummy = {
      contents: [
        { attributes: { id: 'important-point' } },
        { attributes: { id: 'bullet1' } },
        { attributes: { id: 'bullet2' } },
        { attributes: { id: 'youll-never-believe' } },
        { attributes: { id: 'bullet3' } },
        { attributes: { id: 'yule-never-believes' } },
        { attributes: { id: 'bullet4' } },
      ]
    };
    const cases = {
      'all': [
        'important-point',
        'bullet1',
        'bullet2',
        'youll-never-believe',
        'bullet3',
        'yule-never-believes',
        'bullet4'
      ],

      'bullet1, bullet2, bullet3, bullet4': [
        'bullet1',
        'bullet2',
        'bullet3',
        'bullet4'
      ],

      'bullet1..bullet3': [
        'bullet1',
        'bullet2',
        'youll-never-believe',
        'bullet3'
      ],

      'yule-never-believes...': [
        'yule-never-believes',
        'bullet4'
      ],

      '...yule-never-believes': [
        'important-point',
        'bullet1',
        'bullet2',
        'youll-never-believe',
        'bullet3',
        'yule-never-believes'
      ]
    };

    Object.entries(cases).forEach(([ref, expected]) => {
      test(`%reveal: ${ref}`, () => {
        expect(expandBlockReference(slideIrDummy, ref)).toEqual(expected);
      });
    });
  });

  test.describe('extractGroups', () => {

    const makeSlideIr = (frontmatterProps) => ({
      frontmatter: {
        title: 'Things you and Yule never believes',
        ...frontmatterProps
      },
      contents: [
        { attributes: { id: 'important-point' } },
        { attributes: { id: 'bullet1' } },
        { attributes: { id: 'bullet2' } },
        { attributes: { id: 'youll-never-believe' } },
        { attributes: { id: 'bullet3' } },
        { attributes: { id: 'yule-never-believes' } },
        { attributes: { id: 'bullet4' } },
      ]
    });

    const cases = [
      {
        desc: 'Unnamed group with all blocks and no style given.',
        props: {
          '%reveal': 'all'
        },
        expected: {
          keys: ['%reveal'],
          groups: {
            __default: {
              __targetBlocks: [
                'important-point',
                'bullet1',
                'bullet2',
                'youll-never-believe',
                'bullet3',
                'yule-never-believes',
                'bullet4'
              ]
            }
          }
        }
      },

      {
        desc: 'Unnamed group with all blocks and single style prop.',
        props: {
          '%reveal': 'all',
          '%reveal.style': 'opacity: 1 | 0;'
        },
        expected: {
          keys: ['%reveal', '%reveal.style'],
          groups: {
            __default: {
              __targetBlocks: [
                'important-point',
                'bullet1',
                'bullet2',
                'youll-never-believe',
                'bullet3',
                'yule-never-believes',
                'bullet4'
              ],
              style: {
                enter: {
                  opacity: '1'
                },
                rewind: {
                  opacity: '0'
                }
              }
            }
          }
        }
      },

      {
        desc: 'Named group with named blocks with multi-prop style',
        props: {
          '%reveal[bullets]': 'bullet1, bullet2, bullet3, bullet4',
          '%reveal[bullets].style': 'transform: scale(1) | scale(0); opacity: 1 | 0;'
        },
        expected: {
          keys: ['%reveal[bullets]', '%reveal[bullets].style'],
          groups: {
            bullets: {
              __targetBlocks: [
                'bullet1',
                'bullet2',
                'bullet3',
                'bullet4'
              ],
              style: {
                enter: {
                  transform: 'scale(1)',
                  opacity: '1'
                },
                rewind: {
                  transform: 'scale(0)',
                  opacity: '0'
                }
              }
            }
          }
        }
      },
    ];

    cases.forEach(({desc, props, expected}) => {

      test(`${desc}`, () => {
        // Given
        const slideIr = makeSlideIr(props);

        // When
        const groups = extractGroups(slideIr);

        // Then
        expect(groups).toEqual(expected);
      });

    });
  });
});
