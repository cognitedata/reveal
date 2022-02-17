Feature: Start Page

  Start Page for Charts

  Background: This happens before every scenario
    Given I open the Charts page
    And I perform login

  Scenario: Start Page Appearance
    Then I see a sidebar with the title "Filters"
    And Inside the sidebar, I see a button with the text "Favorite Charts"
    And Inside the sidebar, I see a button with the text "Charts created by me"
    And Inside the sidebar, I see a button with the text "Public charts"
    And Inside the sidebar, I see a button with the text "Public charts"
    And I see a button with the text "New chart"
    And I see a search field with te placeholder "Search charts"
    And I see a table with the columns Name, Owner, Last Opened, Last Edited
    # Continue here please


# Please add usage scenarios here
