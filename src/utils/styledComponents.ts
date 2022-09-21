import styled from 'styled-components';
import theme from 'styles/theme';
import Input from 'antd/lib/input';
import Card from 'antd/lib/card';
import Table from 'antd/lib/table';
import { Button, Input as CogsInput } from '@cognite/cogs.js';
import Tag from 'antd/lib/tag';
import Select from 'antd/lib/select';
import Menu from 'antd/lib/menu';

import Row from 'antd/lib/row';
import zIndex from 'utils/zIndex';

const { Search } = Input;

export const InputField = styled(CogsInput)`
  width: 600px;
`;

export const SectionTitle = styled.h3`
  font-style: normal;
  font-weight: bold;
  font-size: 24px;
`;

export const TitleOrnament = styled.div`
  background: ${theme.specificTitleOrnamentColor};
  height: 4px;
  width: 24px;
  margin-bottom: 10px;
`;

export const SectionCard = styled(Card)`
  margin-bottom: 10px;
  cursor: pointer;
  box-sizing: border-box;
  padding: 10px;
  &:hover {
    transform: scale(1.01);
    box-shadow: 0 2px 7px grey;
  }
`;

export const IconWrapper = styled.div`
  display: inline;
`;

export const StatusTable = styled(Table)`
  border: 2px solid ${theme.disabledColor};
  box-sizing: border-box;
  border-radius: 8px;
`;

export const ChangesSavedWrapper = styled.div`
  margin-bottom: 10px;
  text-align: right;
  border-radius: 4px;
  color: white;
  display: inline-block;
  margin-right: 20px;
  padding: 3px;
  position: absolute;
  bottom: 0;
  text-align: center;
  z-index: ${zIndex.CHANGES_SAVED_NOTIFICATION};
  margin-left: 40%;
`;

export const SaveButton = styled(Button)`
  position: absolute;
  right: 0;
  bottom: 0;
  margin-top: 50px;
  margin-bottom: 10px;
  margin-right: 25px;
  z-index: ${zIndex.DATA_SETS_SAVE_BUTTON};
`;

export const CreateButton = styled(Button)`
  background: #4a67fb;
  float: right;
  margin-top: 10px;
`;

export const ApprovedDot = styled.div`
  width: 7px;
  height: 7px;
  background-color: #2acf58;
  border-radius: 50%;
  display: inline-block;
  margin-right: 4px;
`;

export const UnApprovedDot = styled.div`
  width: 7px;
  height: 7px;
  background-color: red;
  border-radius: 50%;
  display: inline-block;
  margin-right: 4px;
`;

export const InfoTitle = styled.h3`
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  margin-top: 20px;
`;

export const InfoSubtitle = styled.p`
  font-weight: normal;
  font-size: 16px;
`;

export const MiniInfoTitle = styled.h3`
  font-weight: bold;
  font-size: 16px;
  margin-top: 10px;
`;

export const InformationWrapper = styled.div`
  font-style: italic;
  font-size: 14px;
  color: ${theme.textColor};
  padding-left: 10px;
  border-left: ${theme.accentColor} solid 8px;
`;

export const BlockedInformationWrapper = styled(InformationWrapper)`
  background: ${theme.backgroundColor};
`;

export const ContentView = styled.div`
  padding-left: 20px;
`;

export const ItemLabel = styled.h4`
  font-size: 16px;
  text-transform: uppercase;
  margin-top: 25px;
`;

export const SubLabel = styled.p`
  font-weight: bold;
  font-size: 16px;
  line-height: 35px;
`;

export const LabelOrnament = styled.div`
  width: 70px;
  height: 4px;
  background: #d9d9d9;
  display: flex;
  margin-bottom: 20px;
`;

export const ValueTag = styled(Tag)`
  background: #edf0ff;
  border: 0px;
  color: #4a67fb;
  margin: 4px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 17px;
  padding: 4px;
  padding-left: 8px;
  padding-right: 8px;
`;

export const EmptyValueTag = styled(ValueTag)`
  background: #bfbfbf;
  color: #595959;
`;

export const StyledSelect = styled(Select)`
  background: #f5f5f5;
  border-radius: 4px;
  width: 90%;
`;

export const NoDataText = styled.p`
  font-style: italic;
`;

export const LineageDot = styled.div`
  height: 10px;
  width: 10px;
  border-radius: 20px;
  background: #4a67fb;
`;
export const EmptyLineageDot = styled.div`
  height: 10px;
  width: 10px;
  border-radius: 20px;
  background: ${theme.disabledColor};
`;

export const LineageTitle = styled.h5`
  font-size: 16px;
`;

export const LineageSubTitle = styled.p`
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
`;

export const LineageTag = styled(Tag)`
  background: #f5f5f5;
  border: 1px solid #dfdfdf;
  box-sizing: border-box;
  margin: 5px;
`;

export const ListBox = styled.div`
  border: 2px solid #d9d9d9;
  box-sizing: border-box;
  border-radius: 4px 0px 0px 4px;
  height: 400px;
  overflow-y: auto;
`;

export const SearchWrapper = styled.div`
  padding: 2px;
  background: #f5f5f5;
`;

export const SearchField = styled(Search)`
  border: 2px solid #e8e8e8;
  box-sizing: border-box;
`;

export const StyledMenuItem = styled(Menu.Item)`
  border-bottom: 1px solid ${theme.borderColor};
  font-weight: bold;
`;

export const RawCreateButton = styled(Button)`
  background: #4a67fb;
  width: 100%;
  font-style: normal;
  font-weight: bold;
  font-size: 13px;
  color: white;
`;

export const BasicInfoPane = styled.div`
  padding-left: 20px;
  display: inline-block;
  width: 100%;
`;

export const SeperatorLine = styled.div`
  height: 100%;
  border-right: 2px solid #dddddd;
  width: 100%;
`;

export const DetailsPane = styled.div`
  height: 100%;
  padding-left: 20px;
  display: inline-block;
  width: 100%;
`;

export const PaneTitle = styled.h4`
  text-transform: uppercase;
  font-size: 18px;
  padding-bottom: 20px;
`;

export const ItemValue = styled.div`
  font-size: 14px;
`;

export const LabelTag = styled(Tag)`
  font-size: 12px;
  border: 1px solid #4a67fb;
  box-sizing: border-box;
  border-radius: 20px;
  color: #4a67fb;
  background: white;
  margin: 4px;
`;

export const LabelTagGrey = styled(Tag)`
  font-size: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  border-radius: 20px;
  color: #595959;
  background: rgba(0, 0, 0, 0.05);
  margin: 4px;
`;

export const SelectorWrapper = styled.div`
  text-align: center;
  display: inline-block;
`;

export const NotSetDot = styled.div`
  width: 7px;
  height: 7px;
  background-color: orange;
  border-radius: 50%;
  display: inline-block;
  margin-right: 2px;
`;

export const DrawerHeader = styled.div`
  background: #4a67fb;
  box-shadow: 0px 8px 48px rgba(0, 0, 0, 0.1);
  display: inline;
  color: white;
`;

export const BorderedBox = styled(Row)`
  border: 2px solid ${theme.primaryBackground};
  border-radius: 4px;
  display: flex;
  width: 76%;
  margin-bottom: 20px;
  justify-content: space-evenly;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
  height: 65px;
`;

export const EmptyBorderedBox = styled(BorderedBox)`
  border: 1px solid #bfbfbf;
`;

export const PreviewToolbar = styled.div`
  display: flex;
  -webkit-box-pack: justify;
  justify-content: space-between;
  -webkit-box-align: center;
  align-items: center;
  min-height: 50px;
  padding-left: 16px;
  width: 100%;
  position: sticky;
  top: 0px;
  z-index: ${zIndex.DATA_SETS_PREVIEW_TOOLBAR};
  border-top: 2px solid ${theme.borderColor};
  border-bottom: 2px solid ${theme.borderColor};
`;

export const OptionWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 5px 0;
`;

export const OptionTitle = styled.div`
  width: 25%;
  padding-left: 10px;
`;

export const OptionDescription = styled.div`
  width: 75%;
  font-weight: normal;
  white-space: normal;
`;

export const GroupLabel = styled.span`
  font-size: 14px;
`;

export const TooltipLink = styled.a`
  font-weight: bold;
  text-decoration: underline;
  color: white;
`;
export const ThinBorderLine = styled.div`
  height: 1px;
  width: 100%;
  background: #dddddd;
  margin-top: 2px;
`;

export const FilterWrapper = styled.div`
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const NoStyleList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  li {
    margin: 0;
    padding: 0;
  }
`;

export const FieldLabel = styled.p`
  font-weight: bold;
  font-size: 14px;
  margin-top: 20px;
`;

export const RequiredFieldLabel = styled(FieldLabel)`
  :before {
    content: '*  ';
    color: red;
  }
`;
