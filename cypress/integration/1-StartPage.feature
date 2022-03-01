Feature: Start Page

Start Page for Charts

    Scenario: Start Page Appearance
        Given I open the Charts page
        And I perform login
        Then I see a sidebar with the title "Filters"
        And Inside the sidebar, I see a button with the text "Favorite Charts"
        And Inside the sidebar, I see a button with the text "Charts created by me"
        And Inside the sidebar, I see a button with the text "Public charts"
        And I see a button with the text "New chart"
        And I see a search field with te placeholder "Search charts"
        And I see a table with the columns Name, Owner, Last Opened, Last Edited

    Scenario: Create new chart
        Given I open the Charts page
        And I perform login
        When I click the button with the text "+ New chart"
        Then I see am directed to a new page with the text "New Chart" in the top navigation bar
        And Inside the top naviagation bar, I see a button with the text "All charts"

    Scenario: Sort charts list
        Given I open the Charts page
        And I perform login
        When I click on the drop down button with the text "Sort by:"
        And Inside the dropdown selector, I click an option with the text "Owner"
        Then I see a dropdown with the text "Sort by: Owner"

    Scenario: Change to grid view
        Given I open the Charts page
        And I perform login
        When I click on a button with the icon "cogs-icon-List"
        Then I see a table with a column named "Preview"

    Scenario: Switch to public charts
        Given I open the Charts page
        And I perform login
        When I click on a button with the text "Public charts"
        Then I at least one chart whose owner does not equal the current user

    Scenario: Rename chart
        Given I open the Charts page
        And I perform login
        When I click the "..." menu
        And I click the button with the text "Rename"
        Then I see a button with the text "Cancel"
        And when I press the "Return" key
        Then I no longer see a button with the text "Cancel"

    Scenario: Duplicate chart
        Given I open the Charts page
        And I perform login
        When I click the "..." menu
        And I click the button with the text "Duplicate"
        Then I see am directed to a new page with the text "Copy" in the top navigation bar

    Scenario: Delete chart
        Given I open the Charts page
        And I perform login
        When I click the "..." menu
        And I click the button with the text "Delete"
        Then I have one fewer chart created by my user in "My charts"

    Scenario: Search chart
        Given I have 3 charts with the names "Chart 1", "Chart 2", "Chart 3"
        And I open the Charts page
        And I perform login
        When I type "2" into the search field
        Then I see only "Chart 2" in the table
