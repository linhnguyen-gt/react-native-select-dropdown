import React, {forwardRef, useImperativeHandle} from 'react';
import {FlatList, Text, TouchableOpacity, View, ActivityIndicator, ScrollView} from 'react-native';
import DropdownModal from './components/DropdownModal';
import DropdownOverlay from './components/DropdownOverlay';
import DropdownWindow from './components/DropdownWindow';
import Input from './components/Input';
import {isExist} from './helpers/isExist';
import {mergeStyles} from './helpers/mergeStyles';
import {useLayoutDropdown} from './hooks/useLayoutDropdown';
import {useRefs} from './hooks/useRefs';
import {useSelectDropdown} from './hooks/useSelectDropdown';
import styles from './styles';

const SelectDropdown = (
  {
    data /* array */,
    isLoading /* boolean */,
    onPressDropdown /* function  */,
    onSelect /* function  */,
    defaultButtonText /* String */,
    defaultButtonTextColor /* String */,
    defaultTextItem /* String */,
    labelButtonText /* String */,
    buttonTextAfterSelection /* function */,
    rowTextForSelection /* function */,
    defaultValue /* any */,
    defaultValueByIndex /* integer */,
    disabled /* boolean */,
    disableAutoScroll /* boolean */,
    disabledIndexs /* array of disabled Row index */,
    onFocus /* function  */,
    onBlur /* function  */,
    onScrollEndReached /* function  */, /////////////////////////////
    buttonStyle /* style object for button */,
    buttonTextStyle /* style object for button text */,
    labelTextStyle /* style object for button text */,
    renderCustomizedButtonChild /* function returns React component for customized button */, /////////////////////////////
    renderDropdownIcon,
    dropdownIconPosition,
    statusBarTranslucent,
    dropdownStyle,
    dropdownOverlayColor /* string */,
    showsVerticalScrollIndicator, /////////////////////////////
    rowStyle /* style object for row */,
    rowTextStyle /* style object for row text */,
    selectedRowStyle /* style object for selected row */,
    selectedRowTextStyle /* style object for selected row text */,
    renderCustomizedRowChild /* function returns React component for customized row */, /////////////////////////////
    search /* boolean */,
    searchInputStyle /* style object for search input */,
    searchInputTxtColor /* text color for search input */,
    searchInputTxtStyle /* text style for search input */,
    searchPlaceHolder /* placeholder text for search input */,
    searchPlaceHolderColor /* text color for search input placeholder */,
    renderSearchInputLeftIcon /* function returns React component for search input icon */,
    renderSearchInputRightIcon /* function returns React component for search input icon */,
    onChangeSearchInputText /* function callback when the search input text changes, this will automatically disable the dropdown's interna search to be implemented manually outside the component  */,
    heightDropDown /* size box dropdown */,
  },
  ref,
) => {
  const disabledInternalSearch = !!onChangeSearchInputText;
  /* ******************* hooks ******************* */
  const {dropdownButtonRef, dropDownFlatlistRef} = useRefs();
  const {
    dataArr, //
    selectedItem,
    selectedIndex,
    selectItem,
    reset,
    searchTxt,
    setSearchTxt,
  } = useSelectDropdown(data, defaultValueByIndex, defaultValue, disabledInternalSearch);
  const {
    isVisible, //
    setIsVisible,
    buttonLayout,
    onDropdownButtonLayout,
    getItemLayout,
    dropdownWindowStyle,
    onRequestClose,
  } = useLayoutDropdown(data, dropdownStyle, rowStyle, search, defaultTextItem, heightDropDown);
  useImperativeHandle(ref, () => ({
    reset: () => {
      reset();
    },
    openDropdown: () => {
      openDropdown();
    },
    closeDropdown: () => {
      closeDropdown();
    },
    selectIndex: index => {
      selectItem(index);
    },
  }));
  /* ******************* Methods ******************* */
  const openDropdown = () => {
    onPressDropdown?.();
    dropdownButtonRef.current.measure((fx, fy, w, h, px, py) => {
      onDropdownButtonLayout(w, h, px, py);
      setIsVisible(true);
      onFocus && onFocus();
    });
  };
  const closeDropdown = () => {
    setIsVisible(false);
    setSearchTxt('');
    onBlur && onBlur();
  };
  const onLayout = () => {
    if (disableAutoScroll) {
      return;
    }
    if (selectedIndex >= 3 && dropDownFlatlistRef) {
      dropDownFlatlistRef.current.scrollToOffset({
        offset: rowStyle && rowStyle.height ? rowStyle.height * selectedIndex : 50 * selectedIndex,
        animated: true,
      });
    }
  };
  const onSelectItem = (item, index) => {
    closeDropdown();
    onSelect && onSelect(item, index);
    selectItem(index);
  };

  const onSelectDoneText = () => {
    closeDropdown();
    reset();
    onSelect && onSelect({name: '', value: ''}, -1);
  };

  /* ******************** Render Methods ******************** */
  const renderSearchView = () => {
    return (
      search && (
        <Input
          searchViewWidth={buttonLayout.w}
          value={searchTxt}
          valueColor={searchInputTxtColor}
          placeholder={searchPlaceHolder}
          placeholderTextColor={searchPlaceHolderColor}
          onChangeText={txt => {
            setSearchTxt(txt);
            disabledInternalSearch && onChangeSearchInputText(txt);
          }}
          inputStyle={searchInputStyle}
          inputTextStyle={searchInputTxtStyle}
          renderLeft={renderSearchInputLeftIcon}
          renderRight={renderSearchInputRightIcon}
        />
      )
    );
  };
  const renderFlatlistItem = ({item, index}) => {
    const isSelected = index == selectedIndex;
    return (
      isExist(item) && (
        <TouchableOpacity
          disabled={disabledIndexs?.includes(index)}
          activeOpacity={0.8}
          style={mergeStyles(styles.dropdownRow, rowStyle, isSelected && selectedRowStyle)}
          onPress={() => onSelectItem(item, index)}>
          {renderCustomizedRowChild ? (
            <View style={styles.dropdownCustomizedRowParent}>{renderCustomizedRowChild(item, index, isSelected)}</View>
          ) : (
            <Text
              numberOfLines={1}
              allowFontScaling={false}
              style={mergeStyles(styles.dropdownRowText, rowTextStyle, isSelected && selectedRowTextStyle)}>
              {rowTextForSelection ? rowTextForSelection(item, index) : item['name'].toString()}
            </Text>
          )}
        </TouchableOpacity>
      )
    );
  };
  const renderDropdown = () => {
    return (
      isVisible && (
        <DropdownModal statusBarTranslucent={statusBarTranslucent} visible={isVisible} onRequestClose={onRequestClose}>
          <DropdownOverlay onPress={closeDropdown} backgroundColor={dropdownOverlayColor} />
          <DropdownWindow layoutStyle={dropdownWindowStyle}>
            {isLoading ? (
              <View style={styles.containerLoading}>
                <ActivityIndicator size="small" color="black" />
              </View>
            ) : (
              <>
                <ScrollView>
                  {defaultTextItem && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={onSelectDoneText}
                      style={mergeStyles(styles.dropdownRow, rowStyle)}>
                      <Text
                        numberOfLines={1}
                        allowFontScaling={false}
                        style={mergeStyles(styles.dropdownRowText, rowTextStyle)}>
                        {defaultTextItem}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <FlatList
                    scrollEnabled={false}
                    data={dataArr}
                    keyExtractor={(item, index) => item['value'].toString() + index.toString()}
                    ref={dropDownFlatlistRef}
                    renderItem={renderFlatlistItem}
                    getItemLayout={getItemLayout}
                    onLayout={onLayout}
                    ListHeaderComponent={renderSearchView()}
                    stickyHeaderIndices={search && [0]}
                    keyboardShouldPersistTaps="always"
                    onEndReached={() => onScrollEndReached && onScrollEndReached()}
                    onEndReachedThreshold={0.5}
                    showsVerticalScrollIndicator={showsVerticalScrollIndicator}
                  />
                </ScrollView>
              </>
            )}
          </DropdownWindow>
        </DropdownModal>
      )
    );
  };
  ///////////////////////////////////////////////////////
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      ref={dropdownButtonRef}
      disabled={disabled}
      onPress={openDropdown}
      style={mergeStyles(
        styles.dropdownButton,
        dropdownIconPosition == 'left' ? styles.row : styles.rowRevese,
        buttonStyle,
      )}>
      {renderDropdown()}
      {renderDropdownIcon && renderDropdownIcon(isVisible)}
      {renderCustomizedButtonChild ? (
        <View style={styles.dropdownCustomizedButtonParent}>
          {renderCustomizedButtonChild(selectedItem, selectedIndex)}
        </View>
      ) : (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {labelButtonText && (
            <Text
              numberOfLines={1}
              allowFontScaling={false}
              style={[mergeStyles(styles.dropdownButtonText, labelTextStyle), {flex: 0}]}>
              {labelButtonText}
            </Text>
          )}
          <Text
            numberOfLines={1}
            allowFontScaling={false}
            style={mergeStyles(styles.dropdownButtonText, buttonTextStyle)}>
            {isExist(selectedItem) ? (
              buttonTextAfterSelection ? (
                buttonTextAfterSelection(selectedItem, selectedIndex)
              ) : (
                selectedItem['name'].toString()
              )
            ) : (
              <Text style={{color: defaultButtonTextColor}}>{defaultButtonText}</Text>
            )}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default forwardRef((props, ref) => SelectDropdown(props, ref));
