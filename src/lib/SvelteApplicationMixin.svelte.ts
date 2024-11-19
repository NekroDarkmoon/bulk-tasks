import type {
  AnyObject, ConstructorOf, DeepPartial, Mixin
} from '@league-of-foundry-developers/foundry-vtt-types/src/types/utils.d.mts';
import type ApplicationV2 from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/client-esm/applications/api/application.d.mts';

import { mount, unmount } from 'svelte';

function SvelteApplicationMixin<
  BaseClass extends new (...args: any[]) => ApplicationV2.Any
>(BaseApplication: BaseClass) {
  // @ts-expect-error
  class SvelteApplication<
    // BaseClass is the class being mixed. This is given by `HandlebarsApplicationMixin`.
    BaseClassI extends ConstructorOf<ApplicationV2<any, any, any>> = BaseClass,
    // These type parameters should _never_ be explicitly assigned to. They're
    // simply a way to make types more readable so that their names show up in
    // intellisense instead of a transformation of `BaseClass`.
    out RenderOptions extends ApplicationV2.RenderOptions = BaseClassI extends ConstructorOf<
      ApplicationV2.Internal<any, infer _RenderOptions, any>
    >
    ? _RenderOptions
    : never,
    out RenderContext extends AnyObject = BaseClassI extends ConstructorOf<
      ApplicationV2.Internal<any, any, infer _RenderContext>
    >
    ? _RenderContext
    : never,
  > extends BaseApplication {
    declare props: Record<string, any>;

    #componentInstance: Record<string, any> | null = null;

    #svelteData: SvelteApplicationSvelteOptions;

    constructor(...args: any[]) {
      const { svelte, ...options }: Configuration = args[0];
      super(options);

      // Check for svelte data
      if (!svelte) throw Error('No Svelte data found.');

      // Check if a component exists to initialize
      const { component } = svelte;
      if (!component) throw new Error('No Component Found.');

      this.#svelteData = svelte;
    }

    override async close(
      options: DeepPartial<SvelteApplicationMixin.ClosingOptions> = {}
    ): Promise<this> {
      // Destroy Component instance
      if (this.#componentInstance) {
        unmount(this.#componentInstance);
        this.#componentInstance = null;
      }

      options.animate = false;
      return super.close(options);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    override async _prepareContext(options: SvelteApplicationMixin.RenderOptions) {
      const context: Record<string, any> = {
        ...await super._prepareContext(options)
      };
      return context;
    }

    override async _renderHTML(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      context: RenderContext,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      options: DeepPartial<RenderOptions>
    ): Promise<any> {
      // Update context for props

      return '';
    }

    override _replaceHTML() { }

    override async _renderFrame(options: SvelteApplicationMixin.RenderOptions) {
      const context = $state({ ...(await this._prepareContext(options)) });
      const frame = await super._renderFrame(options);

      const target = this.hasFrame ? frame.querySelector('.window-content') : frame;
      if (!target) return frame;

      const { component } = this.#svelteData ?? {};
      if (!component) return frame;

      target.innerHTML = '';
      this.#componentInstance = mount(component, {
        target,
        props: { ...this.props, context }
      });

      return frame;
    }
  }

  return SvelteApplication as Mixin<typeof SvelteApplication<BaseClass>, BaseClass>;
}

export type SvelteApplicationSvelteOptions = {
  component: any
} & Record<string, unknown>;

export type Configuration = (foundry.applications.api.ApplicationV2.Configuration
  | foundry.applications.api.DialogV2.Configuration
  | foundry.applications.api.DocumentSheetV2.Configuration
) & {
  svelte: SvelteApplicationSvelteOptions;
};

declare namespace SvelteApplicationMixin {
  type RenderOptions = foundry.applications.api.ApplicationV2.RenderOptions;
  type ClosingOptions = foundry.applications.api.ApplicationV2.ClosingOptions;
}

export { SvelteApplicationMixin };
