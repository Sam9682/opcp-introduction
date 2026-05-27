"""
Lab 01 - Solution 01: Navigating the Dashboard
================================================

This solution file provides the expected outcomes and verification
for each step in the Dashboard Tour exercise.

Use this file if you need to confirm you completed a step correctly,
or if you encountered an issue during the exercise.
"""


def display_solutions():
    """Display solutions and verification for each step."""

    solutions = [
        {
            "step": 1,
            "title": "Open the OVHcloud Control Panel",
            "verification": (
                "After logging in, you should see your account name "
                "displayed in the top-right corner. The main page shows "
                "a summary of all your OVHcloud services."
            ),
            "common_issues": (
                "If you cannot log in, check that you are using the "
                "correct email address. If you forgot your password, "
                "use the 'Forgot password' link on the login page."
            ),
        },
        {
            "step": 2,
            "title": "Locate the Hosted Private Cloud section",
            "verification": (
                "The left navigation menu should show 'Hosted Private "
                "Cloud' as a category. When expanded, you see your "
                "service names listed underneath."
            ),
            "common_issues": (
                "If you do not see 'Hosted Private Cloud' in the menu, "
                "your account may not have OPCP services provisioned. "
                "Contact your administrator to verify your access."
            ),
        },
        {
            "step": 3,
            "title": "Open your OPCP service",
            "verification": (
                "The dashboard overview page displays your service name "
                "at the top, along with the datacenter location and "
                "service reference number."
            ),
            "common_issues": (
                "If the page shows 'No services found', ensure you "
                "selected the correct service from the menu. You may "
                "need to check with your team which service to use."
            ),
        },
        {
            "step": 4,
            "title": "Review the service status panel",
            "verification": (
                "A green indicator means the service is running normally. "
                "An orange or red indicator means there may be an issue "
                "that requires attention."
            ),
            "common_issues": (
                "If the status shows anything other than 'Active', this "
                "is normal for a lab environment. The important thing is "
                "that you can locate and read the status indicator."
            ),
        },
        {
            "step": 5,
            "title": "Explore the resource summary",
            "verification": (
                "You should see numerical values for CPU, RAM, and "
                "storage. These represent the total capacity of your "
                "OPCP infrastructure."
            ),
            "common_issues": (
                "If resource values show as zero or empty, the service "
                "may still be provisioning. Wait a few minutes and "
                "refresh the page."
            ),
        },
        {
            "step": 6,
            "title": "Find the node list",
            "verification": (
                "The node list shows at least one entry. Each node has "
                "a name, a type (such as 'compute' or 'storage'), and "
                "a status column."
            ),
            "common_issues": (
                "If no nodes appear, your infrastructure may not have "
                "any nodes provisioned yet. This is expected for new "
                "services that have not been configured."
            ),
        },
        {
            "step": 7,
            "title": "Locate the help and support options",
            "verification": (
                "You should see at least two options: a link to "
                "documentation and a way to create a support ticket. "
                "Some interfaces also show a live chat option."
            ),
            "common_issues": (
                "The help icon location may vary slightly depending on "
                "your browser window size. On smaller screens, it may "
                "be inside a menu. Try the top-right area first."
            ),
        },
        {
            "step": 8,
            "title": "Return to the main dashboard",
            "verification": (
                "You are back on the main Control Panel page showing "
                "all your services. The OVHcloud logo always takes you "
                "back to this starting point."
            ),
            "common_issues": (
                "If clicking the logo does not work, use the browser's "
                "back button or type the Control Panel URL directly in "
                "the address bar."
            ),
        },
    ]

    print("=" * 60)
    print("Lab 01: Dashboard Tour - Solutions")
    print("Exercise 01: Navigating the Dashboard")
    print("=" * 60)
    print()

    for solution in solutions:
        print(f"Step {solution['step']}: {solution['title']}")
        print("-" * 50)
        print(f"  Verification: {solution['verification']}")
        print()
        print(f"  Common issues: {solution['common_issues']}")
        print()
        print()

    print("=" * 60)
    print("End of solutions for Exercise 01.")
    print("=" * 60)


if __name__ == "__main__":
    display_solutions()
