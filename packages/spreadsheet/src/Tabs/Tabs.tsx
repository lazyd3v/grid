import React from "react";
import { Sheet, SpreadSheetProps, SheetID } from "../Spreadsheet";
import { GoPlus } from "react-icons/go";
import { MdMenu, MdCheck } from "react-icons/md";
import {
  Flex,
  Box,
  useTheme,
  useColorMode
  // Tooltip,
} from "@chakra-ui/core";
import { DARK_MODE_COLOR } from "../constants";
import { IconButton, Tooltip, Button } from "./../styled";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow
} from "@chakra-ui/core";
import TabItem from "./TabItem";
import { translations } from "../translations";

interface TabProps
  extends Pick<SpreadSheetProps, "isTabEditable" | "allowNewSheet"> {
  selectedSheet: SheetID;
  sheets: Sheet[];
  onSelect?: (id: SheetID) => void;
  onNewSheet?: () => void;
  onChangeSheetName?: (id: SheetID, value: string) => void;
  onDeleteSheet?: (id: SheetID) => void;
  onDuplicateSheet?: (id: SheetID) => void;
  onHideSheet?: (id: SheetID) => void;
  onShowSheet?: (id: SheetID) => void;
  onProtectSheet?: (id: SheetID) => void;
  onUnProtectSheet?: (id: SheetID) => void;
  onChangeTabColor?: (id: SheetID, color?: string) => void;
  leftSpacing?: number;
}

const Tabs: React.FC<TabProps> = props => {
  const {
    sheets,
    onSelect,
    onNewSheet,
    selectedSheet,
    onChangeSheetName,
    onDeleteSheet,
    onDuplicateSheet,
    allowNewSheet,
    onShowSheet,
    onHideSheet,
    onProtectSheet,
    onUnProtectSheet,
    onChangeTabColor,
    leftSpacing = 0
  } = props;
  const theme = useTheme();
  const { colorMode } = useColorMode();
  const isLight = colorMode === "light";
  const color = isLight ? theme.colors.gray[900] : theme.colors.gray[300];
  const visibleSheets = sheets.filter(sheet => !sheet.hidden);
  const visibleSheetsLen = visibleSheets.length;
  return (
    <Flex pl={leftSpacing} alignItems="center" minWidth={0} flex={1}>
      {allowNewSheet && (
        <Tooltip
          placement="top-start"
          hasArrow
          aria-label={translations.add_sheet}
          label={translations.add_sheet}
        >
          <IconButton
            aria-label={translations.add_sheet}
            icon={GoPlus}
            onClick={onNewSheet}
            variant="ghost"
            color={color}
          />
        </Tooltip>
      )}
      <Popover placement="top">
        <PopoverTrigger>
          <Box>
            <Tooltip
              placement="top-start"
              hasArrow
              aria-label={translations.all_sheets}
              label={translations.all_sheets}
            >
              <IconButton
                aria-label={translations.all_sheets}
                icon={MdMenu}
                variant="ghost"
                color={color}
              />
            </Tooltip>
          </Box>
        </PopoverTrigger>
        <PopoverContent
          width={200}
          borderColor={isLight ? undefined : DARK_MODE_COLOR}
        >
          <PopoverArrow />
          <PopoverBody overflow="auto" maxHeight={400}>
            {sheets.map((sheet, idx) => {
              const { name, hidden, id } = sheet;
              const isActive = selectedSheet === id;
              return (
                <Button
                  key={idx}
                  fontWeight="normal"
                  size="sm"
                  variant="ghost"
                  background="none"
                  isFullWidth
                  textAlign="left"
                  justifyContent="left"
                  borderRadius={0}
                  title={name}
                  onClick={() => {
                    if (hidden) {
                      onShowSheet?.(id);
                    }
                    onSelect?.(id);
                  }}
                  opacity={hidden ? 0.5 : 1}
                >
                  <Box
                    as={MdCheck}
                    mr={2}
                    flexShrink={0}
                    visibility={isActive ? "visible" : "hidden"}
                  />
                  <Box isTruncated>{name}</Box>
                </Button>
              );
            })}
          </PopoverBody>
        </PopoverContent>
      </Popover>
      <Box overflow="auto" display="flex" pl={1} pr={1}>
        {visibleSheets.map((sheet, idx) => {
          const isActive = selectedSheet === sheet.id;
          const locked = sheet.locked;
          const tabColor = sheet.tabColor;
          return (
            <TabItem
              key={idx}
              id={sheet.id}
              tabColor={tabColor}
              name={sheet.name}
              isLight={isLight}
              onSelect={onSelect}
              isActive={isActive}
              onChangeSheetName={onChangeSheetName}
              onDeleteSheet={onDeleteSheet}
              onDuplicateSheet={onDuplicateSheet}
              onHideSheet={onHideSheet}
              onProtectSheet={onProtectSheet}
              onUnProtectSheet={onUnProtectSheet}
              onChangeTabColor={onChangeTabColor}
              locked={locked}
              canDelete={visibleSheetsLen > 1}
              canHide={visibleSheetsLen > 1}
            />
          );
        })}
      </Box>
    </Flex>
  );
};

export default Tabs;
