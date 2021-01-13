import { Context, Next } from 'koa';
import { renderToString } from 'react-dom/server';
import {
  createElement as createReactElement,
  ReactElement,
  Fragment,
} from 'react';

import { Options } from './Options';
import { renderPage } from './renderPage';

/**
 * Создаёт Koa middleware, который выполняет рендеринг приложения React.
 *
 * @param options Коллекция настроек middleware.
 */
export const createMiddleware = (options: Options = {}) => {
  const {
    createElement,
    modifyElement,
    renderElement,
    modifyContent,
    createPage,
    modifyPage,
  } = options;

  return async (context: Context, next: Next) => {
    const method = context.method.toLowerCase();

    if (method !== 'head' && method !== 'get') {
      context.throw(405);
    }

    let element = createElement
      ? await Promise.resolve(createElement(context))
      : (createReactElement(Fragment) as ReactElement);

    if (element === false) {
      return next();
    }

    if (modifyElement) {
      element = await Promise.resolve(modifyElement(element, context));
    }

    if (element === false) {
      return next();
    }

    let content = renderElement
      ? await Promise.resolve(renderElement(element, context))
      : renderToString(element);

    if (content === false) {
      return next();
    }

    if (modifyContent) {
      content = await Promise.resolve(modifyContent(content, context));
    }

    if (content === false) {
      return next();
    }

    context.type = 'html';

    if (method === 'head') {
      return next();
    }

    let body: string = content;

    if (createPage) {
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

      body = await renderPage(page);
    }

    context.body = body;
    return next();
  };
};
