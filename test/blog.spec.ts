import { expect } from '@playwright/test';
import { type Fixture } from 'astro/dist/testing';
import testFactory from 'astro/dist/testing/playwright-factory.js';
import * as fs from 'fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Logger } from "tslog";

const logger = new Logger({
  minLevel: 1 /* 0:silly 1:trace 2:debug 3:info 4:warn 5:error 6:fatal */,
});

const FIXTURE_ROOT = new URL('./fixtures/blog/', import.meta.url);
const test = testFactory({root: FIXTURE_ROOT}, true);
const GIT_DIR_BEFORE = path.join(fileURLToPath(FIXTURE_ROOT), "dot-git");
const GIT_DIR_DURING = path.join(fileURLToPath(FIXTURE_ROOT), ".git");

test.beforeAll(async ({astro}: { astro: Fixture }) => {
  // We need a local git repository in order to be able to test Static CMS via the @staticcms/proxy-server
  //logger.debug(`Rename ${GIT_DIR_BEFORE} to ${GIT_DIR_DURING}`);
  //fs.renameSync(GIT_DIR_BEFORE, GIT_DIR_DURING);
  await astro.startDevServer();
});

test.afterAll(async ({astro}: { astro: Fixture }) => {
  await astro.stopDevServer();
  await astro.resetAllFiles();
  if (false && fs.existsSync(GIT_DIR_DURING) && !fs.existsSync(GIT_DIR_BEFORE)) {
    logger.debug(`Rename ${GIT_DIR_DURING} to ${GIT_DIR_BEFORE}`);
    fs.renameSync(GIT_DIR_DURING, GIT_DIR_BEFORE);
  }
});

test.describe('Demo blog Static CMS integration', () => {
  test('Open Blog start site', async ({astro, page}) => {
    await page.goto(astro.resolveUrl('/'));

    const h = page.locator('h2');
    await expect(h, 'original text set').toHaveText('My personal website.');
  });

  test('Open Static CMS page', async ({astro, page}) => {
    await page.goto(astro.resolveUrl('/staticcms'));

    const b = page.locator('button').first();
    await expect(b, 'Login button visible').toHaveText('Login');

    await b.click();
    await page.getByRole('link', {name: 'Markdown Style Guide'}).click();

    const f = page.frameLocator('#preview-pane').frameLocator('iframe');
    await expect(f.locator('h1').first(), 'Page rendered in iframe').toHaveText('Markdown Style Guide');
  });
});
