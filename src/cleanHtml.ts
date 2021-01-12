import { Parser } from 'htmlparser2';

/**
 * Представляет тег в HTML-коде.
 */
type Tag = {
  /**
   * Название тега.
   */
  name: string;

  /**
   * Коллекция атрибутов тега.
   */
  attributes: Record<string, string>;

  /**
   * Позиция первого символа тега.
   */
  firstIndex: number;

  /**
   * Позиция последнего символа тега.
   */
  lastIndex: number;
};

/**
 * Описывает элемент HTML.
 */
type Element = {
  /**
   * Название тега в нижнем регистре.
   */
  name: string;

  /**
   * Коллекция атрибутов тега.
   */
  attributes: Record<string, string>;

  /**
   * Полный текст элемента так, как он представлен в разбираемом коде.
   */
  text: string;
};

/**
 * Обходит в глубину все элементы переданного HTML-кода и вызывает указанную
 * функцию для каждого из них.
 *
 * @param html HTML-код страницы.
 * @param handler Обработчик, который будет вызван для каждого элемента
 * страницы.
 */
const parseHtml = (html: string, handler: (element: Element) => void) => {
  const stack: Tag[] = [];

  return new Promise<void>((resolve) => {
    const parser = new Parser({
      onend: resolve,

      onopentag(name, attributes) {
        stack.push({
          attributes,
          name,
          firstIndex: parser.startIndex,
          lastIndex: parser.endIndex as number,
        });
      },

      onclosetag(name) {
        let tag: Tag | undefined = undefined;

        while (stack.length > 0) {
          tag = stack.pop() as Tag;

          let closeLastIndex: number = -1;
          let isSelfClosing = true;

          const isMatch = tag.name === name;

          if (isMatch) {
            const { startIndex: firstIndex } = parser;
            const lastIndex = parser.endIndex as number;

            isSelfClosing =
              firstIndex === tag.firstIndex && lastIndex === tag.lastIndex;

            if (!isSelfClosing) {
              closeLastIndex = lastIndex;
            }
          }

          const text = isSelfClosing
            ? html.substring(tag.firstIndex, tag.lastIndex + 1)
            : html.substring(tag.firstIndex, closeLastIndex + 1);

          handler({
            text,
            attributes: tag.attributes,
            name: tag.name,
          });

          if (isMatch) {
            break;
          }
        }
      },
    });

    parser.write(html);
    parser.end();
  });
};

/**
 * Очищает от дубликатов скриптов, стилей и метатегов указанный HTML-код.
 *
 * @param html Код HTML-страницы.
 */
export const cleanHtml = async (html: string) => {
  const uniqueElements: Record<string, string> = {};
  let result: string = html;

  await parseHtml(html, (element) => {
    const { name, text, attributes } = element;
    let key: string | undefined;

    switch (name) {
      case 'script': {
        const { src } = attributes;

        if (src) {
          key = `script[src=${src}]`;
        }

        break;
      }

      case 'link': {
        const { rel, href } = attributes;

        if (rel || href) {
          key = `link[rel=${rel}][href=${href}]`;
        }

        break;
      }

      case 'meta': {
        const { name, charset } = attributes;

        if (charset) {
          key = `meta[charset]`;
        } else if (name) {
          key = `meta[name=${name}]`;
        }

        break;
      }
    }

    if (key == null) {
      return;
    }

    const previousText = uniqueElements[key];
    uniqueElements[key] = text;

    if (previousText == null) {
      return;
    }

    const index = result.indexOf(previousText);

    if (index < 0) {
      return;
    }

    const head = result.substr(0, index);
    const tail = result.substr(index + previousText.length);

    result = `${head}${tail}`;
  });

  return result;
};
