'use strict';

// Pure: turn a deps manifest into `npx` argv arrays (without the leading "npx").
function buildCommands(deps) {
  if (!Array.isArray(deps)) {
    throw new TypeError('deps must be an array');
  }
  return deps.map((d) => {
    if (!d || typeof d.repo !== 'string' || typeof d.skill !== 'string') {
      throw new TypeError('each dep needs string {repo, skill}');
    }
    return ['skills', 'add', d.repo, '--skill', d.skill];
  });
}

module.exports = { buildCommands };
