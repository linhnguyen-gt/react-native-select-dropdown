import {useEffect, useMemo, useState} from 'react';
import {Dimensions, I18nManager} from 'react-native';
import {calculateDropdownHeight} from '../helpers/calculateDropdownHeight';
import {useKeyboardRemainingScreenHeight} from './useKeyboardRemainingScreenHeight';

const {height} = Dimensions.get('window');

export const useLayoutDropdown = (data, dropdownStyle, rowStyle, search, defaultTextItem, heightDropDown) => {
  const [isVisible, setIsVisible] = useState(false); // dropdown visible ?
  const [buttonLayout, setButtonLayout] = useState(null);
  const [dropdownPX, setDropdownPX] = useState(0); // position x
  const [dropdownPY, setDropdownPY] = useState(0); // position y
  const [dropdownHEIGHT, setDropdownHEIGHT] = useState(() => {
    return calculateDropdownHeight(
      dropdownStyle,
      rowStyle,
      defaultTextItem ? data?.length + 1 : data?.length || 0,
      search,
    );
  }); // dropdown height
  const [dropdownWIDTH, setDropdownWIDTH] = useState(0); // dropdown width
  const remainigHeightAvoidKeyboard = useKeyboardRemainingScreenHeight();
  const safeDropdownViewUnderKeyboard = rowStyle && rowStyle.height ? rowStyle.height * 3 : 50 * 3;

  useEffect(() => {
    setDropdownHEIGHT(
      calculateDropdownHeight(
        dropdownStyle,
        rowStyle,
        defaultTextItem ? data?.length + 1 : data?.length || 0,
        search,
        heightDropDown,
      ),
    );
  }, [dropdownStyle, rowStyle, data, heightDropDown]);

  const onDropdownButtonLayout = (w, h, px, py) => {
    setButtonLayout({w, h, px, py});
    if (height - 18 < py + h + dropdownHEIGHT) {
      setDropdownPX(px);
      setDropdownPY(py - 2 - dropdownHEIGHT);
    } else {
      setDropdownPX(px);
      setDropdownPY(py + h + 2);
    }
    setDropdownWIDTH(dropdownStyle?.width || w);
  };

  const getItemLayout = (flatlistData, index) => ({
    index,
    length: flatlistData?.length || 0,
    offset: rowStyle && rowStyle.height ? rowStyle.height * index : 50 * index,
  });

  const dropdownWindowStyle = useMemo(() => {
    const top =
      remainigHeightAvoidKeyboard < dropdownPY + safeDropdownViewUnderKeyboard
        ? remainigHeightAvoidKeyboard - safeDropdownViewUnderKeyboard
        : dropdownPY;
    return {
      ...{
        borderTopWidth: 0,
      },
      ...dropdownStyle,
      ...{
        position: 'absolute',
        top: top,
        height: dropdownHEIGHT,
        width: dropdownWIDTH,
      },
      ...(I18nManager.isRTL ? {right: dropdownStyle?.right || dropdownPX} : {left: dropdownStyle?.left || dropdownPX}),
    };
  }, [dropdownStyle, remainigHeightAvoidKeyboard, dropdownPX, dropdownPY, dropdownHEIGHT, dropdownWIDTH]);

  const onRequestClose = () => {
    setIsVisible(false);
  };

  return {
    isVisible,
    setIsVisible,
    buttonLayout,
    onDropdownButtonLayout,
    getItemLayout,
    dropdownWindowStyle,
    onRequestClose,
  };
};
