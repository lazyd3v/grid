import React, { useState } from "react";
import {
  useTheme,
  Box,
  Input,
  Popover,
  PopoverTrigger,
  PopoverBody,
  PopoverArrow,
  Icon,
} from "@chakra-ui/core";
import { MdArrowDropDown, MdLock } from "react-icons/md";
import { KeyCodes } from "@rowsncolumns/grid/dist/types";
import { IconButton, Button, PopoverContent } from "../styled";
import { SheetID } from "../Spreadsheet";
import { ColorPicker } from "../Toolbar/Toolbar";

interface TabItemProps {
  name: string;
  isLight: boolean;
  isActive: boolean;
  id: SheetID;
  onSelect?: (id: SheetID) => void;
  onChangeSheetName?: (id: SheetID, value: string) => void;
  onDeleteSheet?: (id: SheetID) => void;
  onDuplicateSheet?: (id: SheetID) => void;
  onHideSheet?: (id: SheetID) => void;
  onProtectSheet?: (id: SheetID) => void;
  onUnProtectSheet?: (id: SheetID) => void;
  onChangeTabColor?: (id: SheetID, color?: string) => void;
  locked?: boolean;
  canDelete?: boolean;
  canHide?: boolean;
  tabColor?: string;
}

const TabItem: React.FC<TabItemProps> = ({
  name,
  isLight,
  isActive,
  id,
  onSelect,
  onChangeSheetName,
  onDeleteSheet,
  onDuplicateSheet,
  onHideSheet,
  onProtectSheet,
  onUnProtectSheet,
  locked = false,
  canHide = true,
  canDelete = true,
  tabColor = "transparent",
  onChangeTabColor,
}) => {
  const canEditSheet = !locked;
  const canDeleteSheet = !locked && canDelete;
  const canHideSheet = canHide;
  const theme = useTheme();
  const [isEditmode, setIsEditmode] = useState(false);
  const [value, setValue] = useState(name);
  const bg = isActive ? "white" : undefined;
  const color =
    isActive || isLight ? theme.colors.gray[900] : theme.colors.gray[300];
  const shadow = isActive ? "0 1px 3px 1px rgba(60,64,67,.15)" : undefined;
  const borderColor = isLight ? theme.colors.gray[300] : theme.colors.gray[600];
  const enableEditmode = () => {
    canEditSheet && setIsEditmode(true);
  };
  const disableEditmode = () => setIsEditmode(false);
  const height = "39px";
  return (
    <Box
      position="relative"
      display="flex"
      alignItems="center"
      height={height}
      background={bg}
      boxShadow={shadow}
    >
      <Box
        background={tabColor}
        position="absolute"
        left={0}
        bottom={0}
        height="4px"
        zIndex={1}
        right={0}
      />
      {isEditmode ? (
        <Input
          defaultValue={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setValue(e.target.value)
          }
          width="auto"
          onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
            const value = e.currentTarget.value;
            if (value !== name) onChangeSheetName?.(id, value);
            disableEditmode();
          }}
          height="26px"
          background="white"
          pl={1}
          pr={1}
          ml={2}
          mr={2}
          size="sm"
          autoFocus
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.which === KeyCodes.Enter) {
              onChangeSheetName?.(id, value);
              disableEditmode();
            }
            if (e.which === KeyCodes.Escape) {
              disableEditmode();
            }
          }}
        />
      ) : (
        <>
          <Button
            as="div"
            size="sm"
            fontWeight="normal"
            borderRadius={0}
            color={color}
            height={height}
            onDoubleClick={enableEditmode}
            onClick={() => onSelect?.(id)}
            background={bg}
            cursor="pointer"
            _hover={{
              background: isActive
                ? bg
                : isLight
                ? theme.colors.gray[200]
                : theme.colors.gray[800],
            }}
          >
            {locked && (
              <Box mr={1} justifyContent="center" display="flex">
                <MdLock fill="green" />
              </Box>
            )}
            {name}
            <Popover placement="top" usePortal>
              {({ onClose }) => {
                return (
                  <>
                    <PopoverTrigger>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        pl={0}
                        pr={0}
                        minWidth={4}
                        height={4}
                        ml={1}
                        mr={-1}
                        aria-label="More"
                        icon={MdArrowDropDown}
                        fontSize={20}
                        color="gray.400"
                      />
                    </PopoverTrigger>
                    <PopoverContent
                      width={200}
                      borderStyle="solid"
                      borderColor={borderColor}
                    >
                      <PopoverArrow />
                      <PopoverBody>
                        <Button
                          fontWeight="normal"
                          size="sm"
                          variant="ghost"
                          isFullWidth
                          textAlign="left"
                          justifyContent="left"
                          borderRadius={0}
                          background="none"
                          isDisabled={!canDeleteSheet}
                          onClick={(e) => {
                            onClose?.();
                            onDeleteSheet?.(id);
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          Delete
                        </Button>
                        <Button
                          fontWeight="normal"
                          size="sm"
                          variant="ghost"
                          background="none"
                          isFullWidth
                          textAlign="left"
                          justifyContent="left"
                          borderRadius={0}
                          onClick={(e) => {
                            onClose?.();
                            onDuplicateSheet?.(id);
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          Duplicate
                        </Button>
                        <Popover placement="left" trigger="hover">
                          <PopoverTrigger>
                            <Button
                              fontWeight="normal"
                              size="sm"
                              variant="ghost"
                              isFullWidth
                              textAlign="left"
                              background="none"
                              justifyContent="left"
                              borderRadius={0}
                              isDisabled={!canEditSheet}
                            >
                              <Box flex={1}>Change color</Box>
                              <Icon name="chevron-right" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            width={280}
                            borderStyle="solid"
                            borderColor={borderColor}
                          >
                            <PopoverArrow />
                            <PopoverBody>
                              <ColorPicker
                                color={tabColor}
                                onChange={(value: string | undefined) => {
                                  onChangeTabColor?.(id, value);
                                  onClose?.();
                                }}
                              />
                            </PopoverBody>
                          </PopoverContent>
                        </Popover>
                        <Button
                          fontWeight="normal"
                          size="sm"
                          variant="ghost"
                          isFullWidth
                          textAlign="left"
                          background="none"
                          justifyContent="left"
                          borderRadius={0}
                          isDisabled={!canEditSheet}
                          onClick={(e) => {
                            enableEditmode();
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          Rename
                        </Button>
                        <Button
                          fontWeight="normal"
                          size="sm"
                          variant="ghost"
                          isFullWidth
                          textAlign="left"
                          background="none"
                          justifyContent="left"
                          borderRadius={0}
                          onClick={(e) => {
                            locked
                              ? onUnProtectSheet?.(id)
                              : onProtectSheet?.(id);
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          {locked ? "Unprotect sheet" : "Protect sheet"}
                        </Button>
                        <Button
                          fontWeight="normal"
                          size="sm"
                          variant="ghost"
                          isFullWidth
                          textAlign="left"
                          background="none"
                          justifyContent="left"
                          borderRadius={0}
                          isDisabled={!canHideSheet}
                          onClick={(e) => {
                            onHideSheet?.(id);
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          Hide sheet
                        </Button>
                      </PopoverBody>
                    </PopoverContent>
                  </>
                );
              }}
            </Popover>
          </Button>
        </>
      )}
    </Box>
  );
};

export default TabItem;
