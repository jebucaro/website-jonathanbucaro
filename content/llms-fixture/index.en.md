---
title: 'llms-markdown fixture'
# Test-only page for scripts/check-llms-fixture.mjs. Never rendered or listed;
# only the `llms-fixture` environment pulls it into llms-full.txt.
build:
    render: never
    list: never
    publishResources: false
---

<!-- markdownlint-disable -->

Intro paragraph.



After three blank lines.

````markdown
## Heading inside a four-backtick fence
```bash
echo hi


echo after two blank lines
```
## Still inside the outer fence
````

## Real heading

~~~text
```
# Inside a tilde fence, not a heading
```
~~~

```python
# Python comment, not a heading
```

###### Deepest heading
