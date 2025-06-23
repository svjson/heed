import path from 'path';

import { loadPresentation, getIndex } from '../presentation.js';
import { createSlide } from '../slide.js';

export const addSlide = async (presentationRoot, _presentationFile, slideId, contextPath, _opts) => {
  const presentation = await loadPresentation(presentationRoot);
  const index = await getIndex(presentationRoot, presentation);

  const prevSlide = findContextualLastSlide(index, presentationRoot, contextPath);

  const fileName = resolveFileName(index, contextPath, prevSlide, slideId);
  const slideFile = path.join(presentationRoot, prevSlide?.path ?? 'slides', `${fileName}.heed`);

  await createSlide(slideFile, { id: fileName });

  return { message: `Successfully created slide ${slideFile}`};
};

/**
 * Find the last slide in the index that matches the context path, otherwise
 * the last slide if any.
 */
const findContextualLastSlide = (index, presentationRoot, contextPath) => {
  const relativePath = path.relative(presentationRoot, contextPath);
  const lastContextSlide = index.reduce((result, entry) => {
    if (!result) return entry;
    return entry.path.startsWith(relativePath) ? entry : result;
  });

  if (lastContextSlide) return lastContextSlide;
  if (index.length > 0) return index.at(-1);

  return null;
};

/**
 * Resolve the file name for the next slide based on the index and context.
 */
const resolveFileName = (index, contextPath, prevSlide, slideId) => {
  const slidePath = prevSlide?.path ?? contextPath ?? 'slides';
  const prefix = getPrefixFrom(prevSlide?.slide);
  const nextNumber = getNextIndex(index, slidePath, prefix);

  return `${prefix}${nextNumber}-${slideId}`;
};

/**
 * Get the prefix for the next slide based on the previous slide ID.
 * If the previous slide ID is numbered, then no prefix is required.
 * If it is not numbered, we extract the prefix from it but first
 * check if the previous slide IS a prefixed numbered ID.
 */
const getPrefixFrom = (prevSlideId) => {
  if (!prevSlideId) return '';

  const numeric = /^\d+$/.test(prevSlideId);
  if (numeric) return '';

  const match = prevSlideId.match(/^(.*_)\d+.*$/);
  if (match) return match[1];

  return `${prevSlideId}_`;
};

/**
 * Get the next index for a slide based on existing sibling slides.
 */
const getNextIndex = (index, contextPath, prefix) => {
  const indexNums = index
    .filter(entry => entry.path.startsWith(contextPath))
    .map(entry => entry.slide)
    .filter(slide => slide?.startsWith(prefix))
    .map(slide => parseInt(slide.slice(prefix.length)), 10)
    .filter(n => !isNaN(n));

  const next = 1 + (Math.max(...indexNums, 0));
  return next < 10 ? `0${next}` : `${next}`;
};
