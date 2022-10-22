import * as flags from 'https://deno.land/std@0.160.0/flags/mod.ts';
import * as path from 'https://deno.land/std@0.160.0/path/mod.ts';
import { z } from 'https://deno.land/x/zod@v3.19.1/mod.ts';
import { camelCase } from 'https://deno.land/x/case@2.1.1/mod.ts';

const ArgsSchema = z.object({
  _: z.array(z.string()).length(1),
  path: z.string().default('./'),
  'no-children': z.boolean().default(false),
});
const args = ArgsSchema.safeParse(flags.parse(Deno.args));

if (!args.success) {
  console.error('usage: rve <component name>');
  Deno.exit(0);
}

const componentName = args.data._[0];
const componentCamelName = camelCase(componentName);

const componentPath = path.join(args.data.path, `${componentName}.tsx`);
const stylePath = path.join(args.data.path, `${componentName}.css.ts`);

const addChildren = !args.data['no-children'];

Deno.writeTextFileSync(
  componentPath,
  `
import React from 'react';
import { ${componentCamelName}Style } from './${componentName}.css';

interface ${componentName}Props {
  ${addChildren ? `children: React.ReactNode;` : ''}
}

export const ${componentName}: React.FC<${componentName}Props> = (${
    addChildren ? '{ children }' : 'props'
  }) => {
  return <div className={${componentCamelName}Style}>${
    addChildren ? '{children}' : ''
  }</div>;
}
`
);

Deno.writeTextFileSync(
  stylePath,
  `
import { style } from '@vanilla-extract/css';

export const ${componentCamelName}Style = style({

});
`
);
