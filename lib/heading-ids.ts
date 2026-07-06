export type HeadingIdRegistry = {
  getId: (text: string) => string;
};

export function createHeadingIdRegistry(): HeadingIdRegistry {
  let index = 0;

  return {
    getId() {
      index += 1;
      return `section-${index}`;
    }
  };
}
