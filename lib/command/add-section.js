import fs from 'node:fs/promises';
import path from 'path';

import { getIndexContext } from '../deck-index.js';
import { resolveIndex, resolveDirContext } from '../folder-layout/index.js';
import { loadPresentation } from '../presentation.js';

export const addSection = async (
  presentationRoot,
  _presentationFile,
  sectionId,
  contextPath,
  _options,
) => {
  const presentation = await loadPresentation(presentationRoot);
  const index = await resolveIndex(presentationRoot, presentation, {
    includePath: true,
  });
  const dirContext = await resolveDirContext(
    presentationRoot,
    index,
    contextPath,
  );
  const prevSection = findContextualLastSection(index, dirContext);

  const sectionDirName = resolveDirName(
    prevSection,
    sectionId,
    path.basename(presentationRoot),
  );

  const dirPath = path.join(
    presentationRoot,
    dirContext.path,
    'sections',
    sectionDirName,
  );

  await fs.mkdir(dirPath, { recursive: true });

  return { message: `Successfully created section ${sectionDirName}` };
};

const resolveDirName = (prevSection, sectionId) => {
  const nextNumber = getNextIndex(prevSection);
  return `${nextNumber}-${sectionId}`;
};

const getNextIndex = (prevSection) => {
  if (!prevSection) return '01';
  const last =
    1 + parseInt(prevSection.id.slice(0, prevSection.id.indexOf('-')));
  return last < 10 ? `0${last}` : `${last}`;
};

const findContextualLastSection = (
  index,
  dirContext,
  _contextPath,
  _options,
) => {
  const context = getIndexContext(index, dirContext.thread);

  if (!context?.sections) return null;

  return context.sections.at(-1);
};
