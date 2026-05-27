"""
Lab 01 - Exercise 01: Navigating the Dashboard
================================================

This exercise walks you through the OPCP dashboard interface.
Follow each numbered step in order. Each step describes one action
and tells you what you should see as a result.

Total steps: 8
Estimated time: 15 minutes
Prerequisites: OVHcloud account with OPCP access, web browser
"""


def display_steps():
    """Display all walkthrough steps for the dashboard tour."""

    steps = [
        {
            "step": 1,
            "title": "Open the OVHcloud Control Panel",
            "action": (
                "Open your web browser and go to the OVHcloud Control Panel "
                "login page. Enter your account email and password, then "
                "click the 'Log in' button."
            ),
            "expected_outcome": (
                "You should see the OVHcloud Control Panel home page with "
                "a welcome message and an overview of your services."
            ),
        },
        {
            "step": 2,
            "title": "Locate the Hosted Private Cloud section",
            "action": (
                "In the left-hand navigation menu, look for the 'Hosted "
                "Private Cloud' section. Click on it to expand the menu."
            ),
            "expected_outcome": (
                "You should see a submenu appear with options related to "
                "your Hosted Private Cloud services, including your OPCP "
                "infrastructure."
            ),
        },
        {
            "step": 3,
            "title": "Open your OPCP service",
            "action": (
                "Click on your OPCP service name in the submenu. If you "
                "have multiple services, select the one you want to explore."
            ),
            "expected_outcome": (
                "You should see the OPCP dashboard overview page showing "
                "a summary of your infrastructure including the number of "
                "nodes, storage usage, and service status."
            ),
        },
        {
            "step": 4,
            "title": "Review the service status panel",
            "action": (
                "Look at the top section of the dashboard. Find the "
                "service status indicator, which shows whether your "
                "infrastructure is running normally."
            ),
            "expected_outcome": (
                "You should see a status indicator (typically a colored "
                "dot or badge) showing 'Active' or 'Running'. This "
                "confirms your service is operational."
            ),
        },
        {
            "step": 5,
            "title": "Explore the resource summary",
            "action": (
                "Below the status panel, find the resource summary area. "
                "This section displays your allocated resources such as "
                "CPU cores, RAM, and storage capacity."
            ),
            "expected_outcome": (
                "You should see a summary showing your total allocated "
                "resources and how much is currently in use. Numbers are "
                "displayed in easy-to-read units (cores, GB, TB)."
            ),
        },
        {
            "step": 6,
            "title": "Find the node list",
            "action": (
                "Look for a 'Nodes' or 'Infrastructure' tab on the "
                "dashboard page. Click on it to view the list of all "
                "nodes in your OPCP environment."
            ),
            "expected_outcome": (
                "You should see a table or list showing each node with "
                "its name, type, status, and basic specifications. Each "
                "node represents one compute unit in your infrastructure."
            ),
        },
        {
            "step": 7,
            "title": "Locate the help and support options",
            "action": (
                "Look in the top-right corner of the page for a help "
                "icon (usually a question mark) or a 'Support' link. "
                "Click on it to see available support options."
            ),
            "expected_outcome": (
                "You should see options for accessing documentation, "
                "creating a support ticket, or contacting the OVHcloud "
                "support team. Note these for future reference."
            ),
        },
        {
            "step": 8,
            "title": "Return to the main dashboard",
            "action": (
                "Click on the OVHcloud logo in the top-left corner of "
                "the page, or click the 'Dashboard' link in the "
                "navigation menu."
            ),
            "expected_outcome": (
                "You should return to the main OVHcloud Control Panel "
                "home page. You have now completed the dashboard tour "
                "and know how to navigate the key areas."
            ),
        },
    ]

    print("=" * 60)
    print("Lab 01: Dashboard Tour")
    print("Exercise 01: Navigating the Dashboard")
    print("=" * 60)
    print()

    for step in steps:
        print(f"Step {step['step']} of {len(steps)}: {step['title']}")
        print("-" * 50)
        print(f"  Action: {step['action']}")
        print()
        print(f"  Expected outcome: {step['expected_outcome']}")
        print()
        print()

    print("=" * 60)
    print("Congratulations! You have completed the Dashboard Tour.")
    print("You now know how to navigate the main areas of the OPCP")
    print("dashboard and locate key information about your services.")
    print("=" * 60)


if __name__ == "__main__":
    display_steps()
