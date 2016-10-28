# spa Plugin
Simple implementation of Single Page App for jQuery.

Define a collection of elements that represent pages, and the appropriate one
  will be shown when the location hash changes.  Includes support for loading
  content from remote URLs.

Note:  This plugin does not provide routing nor view controller functionality.

# Dependencies
This plugin requires [jQuery Core](https://jquery.com/) and
  [jQuery UI](https://jqueryui.com/).

# Example

```
<ul>
  <li><a href="#static">Static content</a></li>
  <li><a href="#remote">Remotely-loaded content</a></li>
</ul>

<div id="content-area">
  <section id="static">
    <p>Hello, world!</p>
  </section>

  <section id="remote" data-url="https://www.example.com/"></section>
</div>

<script>
  (function($) {
    $(function() {
      $('#content-area').spa();
    });
  })(jQuery);
</script>
```

See `demo/index.html` for a working example.

# Options
- `contentLoader` (Function(url:String), optional) - Function that will be
  invoked to load content for an element with a `data-url` attribute.
- `pageSelector` (String, optional) - Selector used to identify pages.  Defaults
  to `'>section'`.
- `defaultFilter` (String, optional) - Filter applied to `pageSelector`, used to
  find the default page show when the SPA is initialized.  Defaults to
  `':first'`.  If `null`, no page will be loaded by default.
- `init` (Boolean, optional) - Whether to init the SPA right away.  Defaults to
  `true`.

# Methods
- `$('...').spa('init')` - Inits the SPA.  Only needed if the `init` option was
  set to `false`.
- `$('...').spa('reload')` - Reloads the SPA, simulating a browser refresh.
- `$('...').spa('loadPage', selector)` - Loads the page matching the specified
  selector.
  - Note that `selector` can be any valid jQuery selector.
  - The `pageSelector` option will be applied first, then `selector`.
- `$('...').spa('loadDefaultPage')` - Loads the default page, depending on the
  value of the `defaultFilter` option.

# Event Handlers
- `todofixthis.spa.pageNotFound: function(event:Event, selector:String)` -
  triggered after an attempt is made to load a page that does not exist.
- `todofixthis.spa.pageContentStart: function(event:Event, page:DOMElement, url:String)` -
  triggered before loading remote content for a page.
- `todofixthis.spa.pageContentSuccess: function(event:Event, html:String)` -
  triggered after loading remote content succeeds.
- `todofixthis.spa.pageContentFail: function(event:Event, xhr:jqXHR)` -
  triggered after loading remote content fails.
- `todofixthis.spa.pageContentFinish: function(event:Event, page:DOMElement, xhr:jqXHR)` -
  triggered after loading remote content finishes, regardless of whether it
  succeeded.
  - This event is always triggered after `pageContentFail`/`pageContentSuccess`.
- `todofixthis.spa.pageHideStart: function(event:Event, page:DOMElement)` -
  triggered before hiding the active page.
  - When switching between pages, the active page is always hidden before the
    new page is shown.
- `todofixthis.spa.pageHideFinish: function(event:Event, page:DOMElement)` -
  triggered after hiding the active page.
- `todofixthis.spa.pageShowStart: function(event:Event, page:DOMElement)` -
  triggered before showing a new page.
- `todofixthis.spa.pageShowFinish: function(event:Event, page:DOMElement)` -
  triggered after showing a new page.
