import { stripImportExitMarker } from '@/components/catalog/ImportProgressOverlay';

describe('stripImportExitMarker', () => {
  it('removes trailing exit line', () => {
    expect(stripImportExitMarker('hello\n__IMPORT_EXIT__ 0\n')).toBe('hello');
  });

  it('leaves text without marker unchanged', () => {
    expect(stripImportExitMarker('Movie 1/5: Foo')).toBe('Movie 1/5: Foo');
  });
});
