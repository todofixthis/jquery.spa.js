(function($) {
  'use strict';

  $.widget('todofixthis.spa', {
    options: {
      'contentLoader':  null,
      'defaultFilter':  ':first',
      'pageSelector':   '>section',
      'init':           true
    },

    _create:  function() {
      if(! this.options.pageSelector) {
        throw new Error('Invalid `pageSelector` option specified.');
      }

      this.element.find(this.options.pageSelector).hide();

      this._activePage = null;

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

    init: function() {
      this._loadHash(window.location.hash);
      return this.element;
    },

    reload: function() {
      this.element.find(this.options.pageSelector).data('loaded', false);
      if(this._activePage) {
        this._loadPage(this._activePage);
      }
      return this.element;
    },

    loadPage: function(selector) {
      var target =
        this.element
          .find(this.options.pageSelector)
          .filter(selector);

      if(target.length < 1) {
        return this.element.trigger('todofixthis.spa.pageNotFound', selector);
      }

      this._loadPage(target);
      return this.element;
    },

    loadDefaultPage: function() {
      if(this.options.defaultFilter) {
        this._loadPage(
          this.element
            .find(this.options.pageSelector)
            .filter(this.options.defaultFilter)
        );
      }
      return this.element;
    },

    _loadHash: function(hash) {
      if(hash) {
        this.loadPage(hash);
      } else {
        this.loadDefaultPage();
      }
    },

    _loadPage: function(page) {
      if(! page.data('loaded')) {
        var url = page.data('src');
        if(url) {
          this.element.trigger('todofixthis.spa.pageContentStart', page, url);

          var contentLoader =
            this.options.contentLoader || this._defaultContentLoader;

          var widget = this;
          contentLoader(url)
            .done(function(html) {
              page.html(html).data('loaded', true);
              widget.element.trigger(
                'todofixthis.spa.pageContentSuccess',
                page
              );
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

      if(this._activePage) {
        this.element.trigger('todofixthis.spa.pageHideStart', this._activePage);

        this._activePage.hide();

        var previousPage = this._activePage;
        this._activePage = null;

        this.element.trigger('todofixthis.spa.pageHideFinish', previousPage);
      }

      this.element.trigger('todofixthis.spa.pageShowStart', page);
      page.show();
      this._activePage = page;
      this.element.trigger('todofixthis.spa.pageShowFinish', page);
    },

    _defaultContentLoader: function(url) {
      return $.get({
        dataType: 'html',
        url:      url
      })
    }
  });
})(jQuery);
