export function parseDeepArtifact(input: string) {
  const artifactMatch = input.match(/<DeepArtifact id="(.*?)" title="(.*?)">([\s\S]*?)<\/DeepArtifact>/);
  if (!artifactMatch) return null;

  const [, id, title, content] = artifactMatch;
  const fileActions = [];

  const actionRegex = /<DeepAction type="file" filePath="(.*?)">([\s\S]*?)<\/DeepAction>/g;
  let match;
  while ((match = actionRegex.exec(content)) !== null) {
    fileActions.push({ filePath: match[1], content: match[2].trim() });
  }

  return { id, title, files: fileActions };
}
