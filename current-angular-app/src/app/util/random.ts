export function getRandomId(): string { // from https://stackoverflow.com/a/55365334
  const r = randomIdHelper;
  return `${r()}${r()}-${r()}-${r()}-${r()}-${r()}${r()}${r()}`;
}

function randomIdHelper(): string { // from https://stackoverflow.com/a/55365334
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

  