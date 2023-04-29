import React from "react";
import { Config, PreviewStyle, TemplatePreviewProps } from "@staticcms/core";

export type ConfigPreviewTemplate = [
  collection_name: string,
  component: React.FC<TemplatePreviewProps>,
  import_component: string
];

export interface InitStaticCMSOptions {
  config: Omit<Config, "load_config_file">;
  previewStyles?: PreviewStyle[];
  previewTemplates?: ConfigPreviewTemplate[];
  minLogLevel?: number;
}
