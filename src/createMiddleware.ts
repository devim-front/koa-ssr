import { Context, Next } from 'koa';
import { renderToString } from 'react-dom/server';

import { Options } from './Options';
import { compilePage } from './compilePage';

/**
 * Создаёт Koa middleware, который выполняет рендеринг приложения React.
 *
 * @param options Коллекция настроек middleware.
 */
export const createMiddleware = (options: Options) => {
  const {
    createElement,
    modifyElement,
    renderElement,
    createPage,
    modifyPage,
  } = options;

  return async (context: Context, next: Next) => {
    const method = context.method.toLowerCase();

    if (method !== 'head' && method !== 'get') {
      context.throw(405);
    }

    let element = await Promise.resolve(createElement(context));

    if (element === false) {
      return next();
    }

    if (modifyElement) {
      element = await Promise.resolve(modifyElement(element, context));
    }

    if (element === false) {
      return next();
    }

    const content = renderElement
      ? await Promise.resolve(renderElement(element, context))
      : renderToString(element);

    if (content === false) {
      return next();
    }

    context.type = 'html';

    if (method === 'head') {
      return next();
    }

    let page = await Promise.resolve(createPage(content, context));

    if (page === false) {
      return next();
    }

    if (modifyPage) {
      page = await Promise.resolve(modifyPage(page, context));
    }

    if (page === false) {
      return next();
    }

    const output = await compilePage(page);
    context.body = output;

    return next();
  };
};
