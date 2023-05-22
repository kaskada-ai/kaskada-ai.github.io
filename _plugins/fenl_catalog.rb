module Jekyll
    class FenlCatalog < Liquid::Tag

      def initialize(tag_name, function, tokens)
        super
        @function = function.strip
      end

      def render(context)
        "https://kaskada.io/docs-site/kaskada/main/fenl/catalog.html##{@function}"
      end
    end
  end

  Liquid::Template.register_tag('fenl_catalog', Jekyll::FenlCatalog)