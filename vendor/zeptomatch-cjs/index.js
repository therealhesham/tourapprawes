"use strict";

// Minimal glob matcher with the same call signature as zeptomatch:
// zeptomatch(glob | glob[], string) => boolean
function globToRegex(glob) {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*") {
      if (glob[i + 1] === "*") {
        re += ".*";
        i++;
      } else {
        re += "[^/]*";
      }
    } else if (c === "?") {
      re += "[^/]";
    } else {
      re += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    }
  }
  return new RegExp("^" + re + "$", "s");
}

function zeptomatch(glob, str) {
  const globs = Array.isArray(glob) ? glob : [glob];
  return globs.some((g) => globToRegex(g).test(str));
}

module.exports = zeptomatch;
module.exports.default = zeptomatch;
