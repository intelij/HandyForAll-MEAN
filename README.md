# HandyForAll
HandyForAll powered by MEAN Stack

## Prerequisites

* A stable Node.js - Node v6.12.3
* A stable MongoDB - v3.10.10

## Running locally

Update your hosts file (/etc/hosts on Mac OS/Linux, c:\Windows\System32\Drivers\etc\hosts on Windows) and add the following line:

```
127.0.0.1 local.handyforall.com
```

Next, install project dependencies:

```
npm install
node install.js
gulp development
```

Finally, start the development server:

```
sudo npm run dev
```

The app will run at http://local.handyforall.com. Code changes are picked up automatically and reloaded to the browser.


## Branching

Generally speaking, we follow git-flow, except that we use `master` as our integration branch and `production` as our production branch.

* `master` is our current working branch.
* `production` is the current production branch.
* To contribute, make a `fix/` or `feature/` branch off `master` and make a PR on BitBucket when you're ready to merge
* To release, make a `release/X.X.X` branch off master