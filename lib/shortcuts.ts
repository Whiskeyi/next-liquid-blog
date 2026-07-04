const shortcutKeys = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function getShortcutLabel(index: number) {
  return shortcutKeys[index] ?? "";
}

export function getShortcutIndex(key: string) {
  return shortcutKeys.indexOf(key.toUpperCase());
}
