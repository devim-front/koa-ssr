import Koa from 'koa';
import request from 'supertest';
import { createElement, Fragment } from 'react';

import { createMiddleware } from './createMiddleware';
import { createPage } from './createPage';
import { appendHead } from './appendHead';
import { appendBody } from './appendBody';
import { appendNode } from './appendNode';
import { appendBodyAttributes } from './appendBodyAttributes';
import { appendHtmlAttributes } from './appendHtmlAttributes';

describe('createMiddleware', () => {
  describe('createMiddleware.options', () => {
    it('should works', (done) => {
      const app = new Koa();
      app.use(createMiddleware());
      request(app.callback()).get('/').expect(200, '', done);
    });
  });

  describe('createMiddleware.options.createElement', () => {
    it('should works', (done) => {
      const app = new Koa();

      app.use(
        createMiddleware({
          createElement(context) {
            const { url } = context;
            return createElement(Fragment, {}, url);
          },
        })
      );

      request(app.callback()).get('/foo').expect(200, '/foo', done);
    });
  });

  describe('createMiddleware.options.createPage', () => {
    it('should works', (done) => {
      const template =
        '<!DOCTYPE html><html><head></head><body><div id="root"></div></body></html>';

      const app = new Koa();

      app.use(
        createMiddleware({
          createPage() {
            let page = createPage(template);
            page = appendHtmlAttributes(page, 'foo');
            page = appendBodyAttributes(page, 'foo');
            page = appendHead(page, 'foo');
            page = appendBody(page, 'foo');
            page = appendNode(page, 'root', 'foo');
            return page;
          },
        })
      );

      request(app.callback())
        .get('/')
        .expect(
          200,
          '<!DOCTYPE html><html foo><head>foo</head><body foo><div id="root">foo</div>foo</body></html>',
          done
        );
    });
  });
});
