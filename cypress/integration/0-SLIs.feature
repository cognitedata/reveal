Feature: Service Level Indicators

  Service Level Indicators for Charts

  Background: This happens before every scenario
    Given I open the Charts page

  @SLI
  Scenario: Access the main url and reach login
    Then I see "Sign in to" in the page

  @SLI
  Scenario: Summing 1+1 on Charts
    And I perform login
    And I create an empty chart
    When I create a 1+1 calculation
    Then I should see 2 in the chart
