### General Activity Manager

an app fortracking verifying your college achievements in one place

### Installation

You can install this app using the [bench](https://github.com/frappe/bench) CLI:

```bash
pip install frappe-bench
bench init frappe-bench --frappe-branch version-16
cd frappe-bench
bench new-site mysite.local
bench get-app https://github.com/Alok-krishna-kp/GAMARG --branch develop
bench --site mysite.local install-app general_activity_manager
bench set-config developer_mode 1
bench use mysite.local
bench start
bench --site mysite.local migrate
```

### Contributing

This app uses `pre-commit` for code formatting and linting. Please [install pre-commit](https://pre-commit.com/#installation) and enable it for this repository:

```bash
cd apps/general_activity_manager
pre-commit install
```

Pre-commit is configured to use the following tools for checking and formatting your code:

- ruff
- eslint
- prettier
- pyupgrade

### CI

This app can use GitHub Actions for CI. The following workflows are configured:

- CI: Installs this app and runs unit tests on every push to `develop` branch.
- Linters: Runs [Frappe Semgrep Rules](https://github.com/frappe/semgrep-rules) and [pip-audit](https://pypi.org/project/pip-audit/) on every pull request.


### License

mit
