import React, { useEffect, useMemo } from "react";
import { TemplatePreviewProps } from "@staticcms/core";
import { useState } from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionBody, Switch, Button,
} from "@material-tailwind/react";
import { defaultScreenOrientation, IframeBreakpoints, ScreenDimensions } from "./IframeBreakpoints.js";
import CopyCode from "./PreviewCopy.js";
import Code from "./PreviewCode.js";
import { type InitStaticCMSOptions } from "./InitStaticCMSOptions.js";

/**
 * Opens the corresponding page in an iframe where the URL of the corresponding page
 * is `/${props.collection.name}/${props.entry.slug}`.
 *
 * This is not a live rendering of the Static CMS editor. You have to publish the content
 * in Static CMS so the Markdown file is changed on the local filesystem and Rollup recognises a change
 * and rebuilds the website/update the internal cache in SSR development mode.
 * @see {@link https://github.com/StaticJsCMS/static-cms/blob/v2/packages/core/src/interface.ts#L550|BaseField}
 * @see {@link https://github.com/StaticJsCMS/static-cms/blob/v2/packages/core/src/lib/registry.ts#L121|registerPreviewTemplate()}
 * @see {@link https://github.com/StaticJsCMS/static-cms/blob/v2/packages/core/src/components/entry-editor/editor-preview-pane/EditorPreviewPane.tsx#L130|Where is the return value of this function used}
 * @param {import(@staticcms/core/dist/src/interface).TemplatePreviewProps<PreviewPostEntry>} props - The [Static CMS interface TemplatePreviewProps](https://github.com/StaticJsCMS/static-cms/blob/v2/packages/core/src/interface.ts#L317)
 * @param {import(@staticcms/core/src/interface).Collection} props.collection - Definition of the [Collection](https://www.staticcms.org/docs/collection-overview) this _DefaultPreviewTemplate_ is registered for. Anyhow, it is type of [interface FilesCollection](https://github.com/StaticJsCMS/static-cms/blob/v2/packages/core/src/interface.ts#L223) or [interface FolderCollection](https://github.com/StaticJsCMS/static-cms/blob/v2/packages/core/src/interface.ts#L227).
 * @param {import(@staticcms/core/src/interface).Field[]} props.fields - Collection [fields](https://www.staticcms.org/docs/collection-overview#fields) as array of [type Field](https://github.com/StaticJsCMS/static-cms/blob/v2/packages/core/src/interface.ts#L705). _Ignored if props.collection is of type FilesCollection_.
 * @param {import(@staticcms/core/src/interface).Entry<PreviewPostEntry>} props.entry - Details about the current markdown file in edit. E.g. properties of _props.entry.data_ are the front matter of the markdown file as key/value pairs and _props.entry.raw_ is the whole markdown file itself. Further options are defined in [interface Entry](https://github.com/StaticJsCMS/static-cms/blob/v2/packages/core/src/interface.ts#L86).
 * @param {Document | undefined | null} props.document -
 * @param {Window | undefined | null} props.window -
 * @param {import(@staticcms/core/src/interface).WidgetFor<PreviewPostEntry>} props.widgetFor - [ReactNode](https://reactnative.dev/docs/react-node) for the given _props.collection_.
 * @param {import(@staticcms/core/src/interface).WidgetsFor<PreviewPostEntry>} props.widgetsFor - Array of [ReactNode](https://reactnative.dev/docs/react-node) for the given _props.fields_.
 * @param {'dark'|'light'} props.theme - Type of theme used in Static CMS.
 * @returns {JSX.Element} React element used within [Static CMS's EditorPreviewContent() function](https://github.com/StaticJsCMS/static-cms/blob/v2/packages/core/src/components/entry-editor/editor-preview-pane/EditorPreviewContent.tsx#L16).
 *
 */
const DefaultPreviewTemplate: React.FC<
  TemplatePreviewProps
> = (props): JSX.Element => {
  const initStaticCMSParams = (window as any).initStaticCMSParams as InitStaticCMSOptions;
  const markdown = props.entry.raw;
  const [open, setOpen] = useState<number>(0);
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [previewDimension, setPreviewDimension] = useState<ScreenDimensions>(
    defaultScreenOrientation
  );
  const [isPortrait, setIsPortrait] = useState<boolean>(true);
  const [pageMDX, setPageMDX] = useState<string>(markdown);

  const handleOpen = (value: number) => {
    setOpen(open === value ? 0 : value);
  };

  useEffect(() => setPageMDX(markdown), [markdown]);

  const debugInformation = useMemo(
    () => (
      <div className={initStaticCMSParams.minLogLevel || 3 < 3 ? '' : `hidden val-${initStaticCMSParams?.minLogLevel}`}>
        <Accordion open={open === 1}>
          <AccordionHeader onClick={() => handleOpen(1)}>
            DefaultPreviewTemplate(props.collection)
          </AccordionHeader>
          <AccordionBody>
            <pre>{JSON.stringify(props?.collection, null, 2)}</pre>
          </AccordionBody>
        </Accordion>
        <Accordion open={open === 2}>
          <AccordionHeader onClick={() => handleOpen(2)}>
            DefaultPreviewTemplate(props.fields)
          </AccordionHeader>
          <AccordionBody>
            <pre>{JSON.stringify(props?.fields, null, 2)}</pre>
          </AccordionBody>
        </Accordion>
        <Accordion open={open === 3}>
          <AccordionHeader onClick={() => handleOpen(3)}>
            DefaultPreviewTemplate(props.entry)
          </AccordionHeader>
          <AccordionBody>
            <pre>{JSON.stringify(props.entry, null, 2)}</pre>
          </AccordionBody>
        </Accordion>
        <Accordion open={open === 4}>
          <AccordionHeader onClick={() => handleOpen(4)}>
            DefaultPreviewTemplate(props.document)
          </AccordionHeader>
          <AccordionBody>
            <pre>{JSON.stringify(props?.document, null, 2)}</pre>
          </AccordionBody>
        </Accordion>
      </div>
    ),
    [open, props?.collection, props?.fields, props.entry, props?.document, initStaticCMSParams?.minLogLevel]
  );

  return <>
    <div className="space-y-4">
      <div className="flex flex-wrap flex-initial gap-4 items-end">
        {pageMDX && (
          <>
            <Switch
              onChange={() => setShowPreview((state) => !state)}
              checked={!showPreview}
              label="Markdown"
              key="switch-markdown"
              id="switch-markdown"
            />
            <Switch
              onChange={() => setIsPortrait((portrait) => !portrait)}
              checked={!isPortrait && showPreview}
              label="Landscape"
              id="switch_landscape"
              disabled={!showPreview}
            />
            <CopyCode pageCode={pageMDX}/>
          </>
        )}
        {showPreview &&
          IframeBreakpoints.map(
            ({
               name: breakpointName,
               icon: breakpointIcon,
               screen: breakpoint,
             }) => {
              const key_prop = `button-iframe-break-[${breakpointName.replace(
                " ",
                "-"
              )}]`;
              return (
                <Button
                  variant={
                    previewDimension.landscape === breakpoint.landscape &&
                    previewDimension.portrait == breakpoint.portrait
                      ? "filled"
                      : "outlined"
                  }
                  className="flex w-42 items-center gap-1 max-h-8"
                  size="sm"
                  onClick={() => setPreviewDimension(breakpoint)}
                  key={key_prop}
                  id={key_prop}
                >
                  {breakpointIcon}
                  {breakpointName}
                </Button>
              );
            }
          )}
      </div>
      <div className="relative">
        <div className={showPreview ? "block" : "hidden"}>
          <iframe
            className={`rounded-lg bg-white shadow-md border-2 border-blue-500 transition-all ${
              isPortrait
                ? previewDimension.portrait
                : previewDimension.landscape
            }`}
            loading="lazy"
            // TODO: What is the right URL for this page?
            src={`/${props.collection.name}/${props.entry.slug}`}
          ></iframe>
        </div>
        <Code
          showPreview={showPreview}
          pageCode={pageMDX}
          breakpoint={
            isPortrait
              ? defaultScreenOrientation.portrait
              : defaultScreenOrientation.landscape
          }
        />
      </div>
      {debugInformation}
    </div>
  </>;
};

export default DefaultPreviewTemplate;
