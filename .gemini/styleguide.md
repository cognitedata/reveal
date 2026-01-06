# Code Best Practices

## Scope Note
Unless otherwise specified, these rules apply to all code changes in the repository.

---

## 2. TypeScript Type Safety (Global Scope)

### Rule: Avoid Explicit Type Casting using "as any"
- **Guidance:** Explicit type casting to `as any` bypasses TypeScript's type checking system and introduces potential runtime errors. This practice should be strictly avoided as it sacrifices type safety.
- **Preferred Alternative:** Find the correct type, use utility types like `Partial<T>` or `Omit<T, K>`, or use a type assertion to a more specific type if you are certain of the type (e.g., `as T`).
- **Action:** Flag any occurrence of the `as any` pattern in the codebase.

### Rule: Avoid Double Type Casting: "as unknown as SomeType"
- **Guidance:** Using the pattern **`as unknown as SomeType`** is a red flag that forces a type assignment. It is often used to silence the compiler when a genuine type mismatch issue exists. This practice must be avoided.
- **Preferred Alternative:** Use proper runtime validation (e.g., with a validation library) to assert the type correctly, or fix the source of the type mismatch.
- **Action:** Flag any occurrence of the sequential cast pattern **`as unknown as`** in the codebase.

### Rule: Avoid Variables Defined as "any" Type
- **Guidance:** Variables, function arguments, or return types explicitly defined as `any` defeat the purpose of using TypeScript. This should be avoided to maintain strong type safety across the application.
- **Preferred Alternative:** Always define a specific type, even if it requires creating a new interface or type. Use `unknown` or `T` where the type cannot be determined.
- **Action:** Flag any declaration where a variable, parameter, or return type is explicitly set to the `any` keyword.
