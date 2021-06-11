# `rtl-use-custom-render-function`

The wonderful [@testing-library/react] package exposes a `render` function, which can be used to render components for tests.
As apps grow to a nontrivial size, there will often be a need to inject custom wrappers, such as [redux], [react-router], [i18n], and so on.

In order to reduce boilerplate, it can be helpful to create a wrapped `render` function which injects all of this code in a centralized place.
When this happens, it can be helpful to enforce this rule to ensure that the "wrong" `render` isn't used accidentally.
In most cases, this would be caught immediately.
However, it can be problematic if it's a simple component that's expanded later.
