// import { render, screen } from '@testing-library/react';
// import { describe, it } from 'vitest';
// import { MemoryRouter, NavLink } from 'react-router-dom';

// describe('Master product rendering process', () => {
//   // Renders ContainerLayout with correct className and fallback
//   it('should render correctly when the route is active', () => {
//     render(
//       <MemoryRouter
//         initialEntries={[
//           '/master-product/master-product-data',
//         ]}
//       >
//         <NavLink
//           to="/master-product/master-product-data"
//           className={({ isActive, isPending }) =>
//             isPending
//               ? 'pending'
//               : isActive
//                 ? 'block w-full rounded-md bg-slate-100 px-5 py-4'
//                 : 'block w-full bg-white px-5 py-4'
//           }
//         >
//           Master Materials
//         </NavLink>
//       </MemoryRouter>,
//     );
//     const linkElement = screen.getByText('Master Product');
//     expect(linkElement).toHaveClass(
//       'block w-full rounded-md bg-slate-100 px-5 py-4',
//     );
//   });
// });
