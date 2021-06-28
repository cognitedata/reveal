/*!
 * Copyright 2021 Cognite AS
 */
import { Spinner } from './Spinner';
import * as THREE from 'three';

describe('Spinner test cases', () => {
  test('stylesheet is injected when spinner created and removed on disposal', () => {
    const parent = document.createElement('div');

    expect(document.querySelectorAll('style')).toBeEmpty();
    expect(parent.children).toBeEmpty();

    const spinner = new Spinner(parent);

    expect(document.querySelectorAll('style')).not.toBeEmpty();
    expect(parent.children).not.toBeEmpty();

    spinner.dispose();

    expect(document.querySelectorAll('style')).toBeEmpty();
    expect(parent.children).toBeEmpty();
  });

  test('.updateBackgroundColor() updates spinner color', () => {
    const lightBackground = new THREE.Color(0.6, 0.6, 0.6);
    const darkBackground = new THREE.Color(0.1, 0.1, 0.1);

    const parent = document.createElement('div');
    const spinner = new Spinner(parent);
    const spinnerDomElement = parent.firstElementChild!;

    expect(spinnerDomElement.classList.contains(Spinner.classnames.dark)).toBeFalse(); // default is light

    spinner.updateBackgroundColor(lightBackground);

    expect(spinnerDomElement.classList.contains(Spinner.classnames.dark)).toBeTrue();

    spinner.updateBackgroundColor(darkBackground);

    expect(spinnerDomElement.classList.contains(Spinner.classnames.dark)).toBeFalse();
  });

  test('setting loading state updates CSS and title', () => {
    const parent = document.createElement('div');
    const spinner = new Spinner(parent);
    const spinnerDomElement = parent.firstElementChild!;

    expect(spinnerDomElement.classList.contains(Spinner.classnames.loading)).toBeFalse();

    const idleTitle = spinnerDomElement.getAttribute('title');
    spinner.loading = true;

    expect(spinnerDomElement.getAttribute('title')).not.toBe(idleTitle);
    expect(spinnerDomElement.classList.contains(Spinner.classnames.loading)).toBeTrue();

    spinner.loading = false;

    expect(spinnerDomElement.getAttribute('title')).toBe(idleTitle);
    expect(spinnerDomElement.classList.contains(Spinner.classnames.loading)).toBeFalse();
  });
});
