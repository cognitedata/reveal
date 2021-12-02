import React from 'react';
import { CogniteExternalId } from '@cognite/sdk';
import SuiteAvatar from 'components/suiteAvatar';
import { useSelector } from 'react-redux';
import { getSuitePath } from 'store/suites/selectors';
import { Dropdown, Icon, Menu, Title } from '@cognite/cogs.js';
import { Link } from 'react-router-dom';

import {
  SuiteBreadcrumbContainer,
  SuiteBreadcrumbMenu,
  SuiteBreadcrumbMenuItem,
} from './elements';

interface Props {
  suiteKey: CogniteExternalId;
}

const SuiteBreadcrumb: React.FC<Props> = ({ suiteKey }: Props) => {
  const suitePath = useSelector(getSuitePath(suiteKey));

  const pathLength = suitePath.length;

  if (pathLength > 2) {
    const first = suitePath[0];
    const last = suitePath[pathLength - 1];
    return (
      <>
        {/* root suite */}
        <SuiteBreadcrumbContainer key={first.key}>
          <SuiteAvatar color={first.color} title={first.title} />
          <Link to={`/suites/${first.key}`}>
            <Title level={5}>{first.title}</Title>
          </Link>
        </SuiteBreadcrumbContainer>
        {/* other suites */}
        <SuiteBreadcrumbMenu>
          <Dropdown
            className="cogs-btn-ghost"
            content={
              <Menu>
                {suitePath
                  .filter(
                    (_suite, index) => index !== 0 && index !== pathLength - 1
                  )
                  .map((suite) => (
                    <SuiteBreadcrumbMenuItem key={suite.key}>
                      <Menu.Item>
                        <Link to={`/suites/${first.key}`}>
                          <Title level={6}>
                            <Icon type="ChevronBreadcrumb" /> {suite.title}
                          </Title>
                        </Link>
                      </Menu.Item>
                    </SuiteBreadcrumbMenuItem>
                  ))}
              </Menu>
            }
            appendTo={document.body}
            hideOnClick
          >
            <Icon type="ChevronDownCompact" />
          </Dropdown>
        </SuiteBreadcrumbMenu>

        {/* last suite */}
        <SuiteBreadcrumbContainer key={last.key}>
          <Icon type="ChevronBreadcrumb" />
          <Title level={6}>{last.title}</Title>
        </SuiteBreadcrumbContainer>
      </>
    );
  }
  if (suitePath.length > 0) {
    return (
      <>
        {suitePath.map((suite, index) =>
          index === 0 ? (
            <SuiteBreadcrumbContainer key={suite.key}>
              <SuiteAvatar color={suite.color} title={suite.title} />
              <Link to={`/suites/${suite.key}`}>
                <Title level={5}>{suite.title}</Title>
              </Link>
            </SuiteBreadcrumbContainer>
          ) : (
            <SuiteBreadcrumbContainer key={suite.key}>
              <Icon type="ChevronBreadcrumb" />
              <Title level={6}>{suite.title}</Title>
            </SuiteBreadcrumbContainer>
          )
        )}
      </>
    );
  }
  return null;
};

export default React.memo(SuiteBreadcrumb);
