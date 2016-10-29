(function($) {
  'use strict';

  $.widget('todofixthis.spa', {
    options: {
      /* Function used to load remote content for pages.
       *
       * Must accept a String value (URL) and return a jQuery promise
       *  object.
       */
      'contentLoader': function(url) {
        return $.get({
          dataType: 'html',
          url:      url
        })
      },

      /* Selector used to find the default page. */
      'defaultFilter': ':first',

      /* Selector used to identify pages. */
      'pageSelector': '>section',

      /* Whether to initialize the SPA upon creation. */
      'init': true
    },

    _create:  function() {
      if(! this.options.contentLoader) {
        throw new Error('Invalid `contentLoader` option specified.');
      }

      if(! this.options.pageSelector) {
        throw new Error('Invalid `pageSelector` option specified.');
      }

      // Hide static content to reduce chances of FOUS.
      this._getPages().hide();

      // Keep track of the currently-loaded page so that we can hide it
      //  before switching to a new page.
      this._activePage = null;

      // Wire up the event listener for location hash changes.
      var widget = this;
      //noinspection SpellCheckingInspection
      $(window).on('hashchange', function(event) {
        event.preventDefault();
        widget._loadHash(window.location.hash);
      });

      if(this.options.init) {
        this.init();
      }
    },

    /** Initialize the single page app.
     */
    init: function() {
      this._loadHash(window.location.hash);
      return this.element;
    },

    /** Reloads the single page app, simulating a browser refresh.
     */
    reload: function() {
      // Purge remotely-loaded content.
      this._getPages('[data-src]:data(loaded)').each(function() {
        $(this).empty().data('loaded', false);
      });

      this.init();
      return this.element;
    },

    /** Switches to the page matching the specified selector.
     */
    loadPage: function(selector) {
      if(! selector) {
        return this.element;
      }

      var target = this._getPages(selector);

      if(target.length < 1) {
        return this.element.trigger('todofixthis.spa.pageNotFound', selector);
      }

      this._loadPage(target);
      return this.element;
    },

    /** Loads the default page (depending on the `defaultFilter` option).
     */
    loadDefaultPage: function() {
      if(this.options.defaultFilter) {
        this._loadPage(this._getPages(this.options.defaultFilter));
      }
      return this.element;
    },

    /** Returns all pages, optionally matching the specified selector.
     */
    _getPages: function(filter) {
      var elements = this.element.find(this.options.pageSelector);
      return filter ? elements.filter(filter) : elements;
    },

    /** Loads the correct page for the specified location hash.
     */
    _loadHash: function(hash) {
      if(hash) {
        this.loadPage(hash);
      } else {
        this.loadDefaultPage();
      }
    },

    /** Loads the page from the specified DOMElement.
     */
    _loadPage: function(page) {
      if(page.length > 1) {
        page = page.filter(':first');
      }

      if(! page.data('loaded')) {
        var url = page.data('src');
        if(url) {
          this.element.trigger('todofixthis.spa.pageContentStart', page, url);

          var widget = this;
          this.options.contentLoader(url)
            .done(function(html) {
              page.html(html).data('loaded', true);
              widget.element.trigger(
                'todofixthis.spa.pageContentSuccess',
                page
              );

              // Hide the current page, if applicable.
              if(widget._activePage) {
                widget.element.trigger(
                  'todofixthis.spa.pageHideStart',
                  widget._activePage
                );

                widget._activePage.hide();

                var previousPage = widget._activePage;
                widget._activePage = null;

                widget.element.trigger(
                  'todofixthis.spa.pageHideFinish',
                  previousPage
                );
              }

              // Show the new page.
              widget.element.trigger('todofixthis.spa.pageShowStart', page);
              page.show();
              widget._activePage = page;
              widget.element.trigger('todofixthis.spa.pageShowFinish', page);
            })
            .fail(function(jqXhr) {
              widget.element.trigger(
                'todofixthis.spa.pageContentFail',
                page,
                jqXhr
              );
            })
            .always(function(jqXhr) {
              widget.element.trigger(
                'todofixthis.spa.pageContentFinish',
                page,
                jqXhr
              );
            });
        }
      }
    }
  });
})(jQuery);
