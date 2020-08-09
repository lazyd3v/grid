import {
  parseExcel,
  createExcelFileFromSheets,
  ParseProps,
  ParseResults
} from "./excel";
import { parseCSV, createCSVFromSheets } from "./csv";
import { Sheet } from "@rowsncolumns/spreadsheet";

export { parseExcel, parseCSV, ParseProps, ParseResults };
export type Types = "excel" | "csv";
export interface DownloadProps {
  sheets: Sheet[];
  filename: string;
  type?: Types;
}

export enum MIMETYPES {
  CSV = "text/csv",
  EXCEL = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
}

export const canUseDOM = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);

/**
 * Downloads a file type
 * @param param0
 */
export const download = async ({
  sheets = [],
  filename = "download",
  type = "excel"
}: DownloadProps): Promise<Blob | void> => {
  switch (type) {
    case "excel": {
      const buffer = await createExcelFileFromSheets(sheets);
      const blob = new Blob([buffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      if (!canUseDOM) return blob;
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${filename}.xlsx`;
      anchor.dispatchEvent(new MouseEvent("click"));
      break;
    }

    case "csv": {
      const buffer = await createCSVFromSheets(sheets);
      const blob = new Blob([buffer], { type: "text/csv" });
      if (!canUseDOM) return blob;
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${filename}.csv`;
      anchor.dispatchEvent(new MouseEvent("click"));
    }
  }
};

/**
 * Parse support file types
 * @param param0
 */
export const parse = async ({ file }: ParseProps) => {
  if (!file) throw "File is invalid";
  switch (file.type) {
    case MIMETYPES.CSV:
      return parseCSV({ file });
    case MIMETYPES.EXCEL:
      return parseExcel({ file });

    default:
      throw "File type is not supported. Supported file types are xlsx and csv";
  }
};
