const virtualKeyboard = [
    'numeric',
    'alphabetic',
    'greek',
    {
      label: '<span style="font-family:serif;">H₂O</span>',
      rows: [
        [
          '[1]', '[2]', '[3]', '[4]', '[5]', '[6]', '[7]', '[8]', '[9]', '[0]',
        ],
        [
          {latex: '\\textrm{H}', shift: '\\textrm{He}', variants: ['\\textrm{He}', '\\textrm{Hf}', '\\textrm{Hg}', '\\textrm{Hs}', '\\textrm{Ho}']}, 
          {latex: '\\textrm{K}', shift: '\\textrm{Kr}'}, 
          {latex:'\\textrm{B}', shift: '\\textrm{Be}', variants: ['\\textrm{Ba}', '\\textrm{Br}', '\\textrm{Bi}', '\\textrm{Bh}', '\\textrm{Bk}']}, 
          {latex: '\\textrm{V}'}, 
          {latex: '\\textrm{C}', shift: '\\textrm{Ca}', variants: ['\\textrm{Cs}', '\\textrm{Cl}', '\\textrm{Co}', '\\textrm{Cr}', '\\textrm{Cu}', '\\textrm{Ce}', '\\textrm{Cm}', '\\textrm{Cd}']},
          {latex: '\\textrm{O}', shift: '\\textrm{Os}'},
          {latex: '\\textrm{N}', shift: '\\textrm{Na}', variants: ['\\textrm{Ne}', '\\textrm{Nb}', '\\textrm{Ni}', '\\textrm{Np}', '\\textrm{No}']},
          {latex: '\\textrm{F}', shift: '\\textrm{Fe}', variants: ['\\textrm{Fl}', '\\textrm{Fr}', '\\textrm{Fm}']},
          {latex: '\\textrm{P}', shift: '\\textrm{Pd}', variants: ['\\textrm{Pt}', '\\textrm{Pb}', '\\textrm{Po}', '\\textrm{Pr}', '\\textrm{Pm}', '\\textrm{Pu}', '\\textrm{Pa}']},
          {latex: '\\textrm{S}', shift: '\\textrm{Si}', variants: ['\\textrm{Si}', '\\textrm{Sc}', '\\textrm{Se}', '\\textrm{Sr}', '\\textrm{Sn}', '\\textrm{Sb}', '\\textrm{Sg}', '\\textrm{Sm}']}
        ],
        [
          '\\textrm{Y}',
          {latex: '\\textrm{I}', shift: '\\textrm{In}', variants: ['\\textrm{Ir}']}, 
          {latex: '\\textrm{Ai}', shift: '\\textrm{Ar}', variants: ['\\textrm{Al}', '\\textrm{Ag}', '\\textrm{As}', '\\textrm{Au}', '\\textrm{Ac}', '\\textrm{Am}']}, 
          {latex: '\\textrm{Db}', shift: '\\textrm{Ds}', variants: ['\\textrm{Dy}']}, 
          {latex: '\\textrm{Eu}', shift: '\\textrm{Er}', variants: ['\\textrm{Es}']},
          {latex: '\\textrm{Ga}', shift: '\\textrm{Ge}', variants: ['\\textrm{Gd}']},
          {latex: '\\textrm{Li}', shift: '\\textrm{Lv}', variants: ['\\textrm{La}', '\\textrm{Lr}']},
          {latex:'\\textrm{Mg}', shift: '\\textrm{Mn}', variants: ['\\textrm{Mo}', '\\textrm{Mt}']},
          {latex:'\\textrm{Rb}', shift: '\\textrm{Ru}', variants: ['\\textrm{Rh}', '\\textrm{Rf}', '\\textrm{Rg}']},
          {latex: '\\textrm{Ti}', shift: '\\textrm{Tc}', variants: ['\\textrm{Te}', '\\textrm{Ta}', '\\textrm{Tl}', '\\textrm{Tb}', '\\textrm{Tm}', '\\textrm{Th}']}
        ],
        [
          {latex: '\\textrm{U}', shift: '\\textrm{Uut}', variants: ['\\textrm{Uup}', '\\textrm{Uus}', '\\textrm{Uuo}']},
          '\\textrm{Xe}',
          {latex: '\\textrm{Zn}', shift: '\\textrm{Zr}'}, 
          {latex: '\\textrm{Y}', shift: '\\textrm{Yb}'},
          {
            latex: '\\leftarrow',
            shift: '\\rightarrow',
            variants: [
                ' \\twoheadrightarrow',
                ' \\twoheadleftarrow',
                '\\rightarrowtail',
                '\\leftarrowtail',
                '\\dashrightarrow',
                '\\dashleftarrow',
                '\\longrightarrow',
                '\\longleftarrow',
                '\\longleftrightarrow',
                '\\Rightarrow',
                '\\Leftarrow',
                '\\Longrightarrow',
                '\\Longleftarrow',
                '\\Longleftrightarrow',
                '\\leftrightarrows',
                '\\rightleftarrows',
                '\\rightleftarrows',
                '\\leftleftarrows',
                '\\rightrightarrows',
            ]
        }, 
        {
            latex: '\\rightharpoonup',
            shift: '\\leftrightharpoons',
            variants: [
                '\\rightharpoondown',
                '\\leftharpoondown',
                '\\rightleftharpoons',
                '\\leftrightharpoons',
            ]
        },
        {
            latex: '\\xrightarrow[{#@}]{}',
            shift: '\\xleftarrow[{#@}]{}',
            variants: [
                '\\xrightarrow[{#@}]{#@}',
                '\\xleftarrow[{#@}]{#@}',
                '\\longleftrightarrow[{#@}]{}',
                '\\longleftrightarrow[{}]{#@}',
                '\\longleftrightarrow[{#@}]{#@}',
                '\\xRightarrow[{#@}]{}',
                '\\xRightarrow[{}]{#@}',
                '\\xRightarrow[{#@}]{#@}',
                '\\xLeftarrow[{#@}]{}',
                '\\xLeftarrow[{}]{#@}',
                '\\xLeftarrow[{#@}]{#@}',
            ]
        },
        {
            latex: '\\xrightharpoonup[{#@}]{}',
            shift: '\\xleftrightharpoons[{#@}]{}',
            variants: [
                '\\xrightharpoondown[{#@}]{}',
                '\\xrightharpoondown[{}]{#@}',
                '\\xrightharpoondown[{#@}]{#@}',
                '\\xleftharpoondown[{#@}]{}',
                '\\xleftharpoondown[{}]{#@}',
                '\\xleftharpoondown[{#@}]{#@}',
                '\\xrightleftharpoons[{#@}]{}',
                '\\xrightleftharpoons[{}]{#@}',
                '\\xrightleftharpoons[{#@}]{#@}',
                '\\xleftrightharpoons[{#@}]{}',
                '\\xleftrightharpoons[{}]{#@}',
                '\\xleftrightharpoons[{#@}]{#@}',
            ]
        },
        {latex: 'x_{#@}', insert:'_{}'}, {latex: 'x^{#@}' ,insert:'^{}'}, {latex: '{x}^{y}_{z}', insert: '{#@}^{#@}_{#@}'}],
        ['[shift]', '[left]', '[right]', '\\textrm{ }', '[up]', '[down]', '[backspace]']
      ]
    }
  ]

  export default virtualKeyboard;