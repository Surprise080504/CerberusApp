import { createTheme, responsiveFontSizes } from "@material-ui/core/styles";
import fonts from "./fonts";
import commonSettings from "./global.js";

const lightTheme = {
  color: "#FFFFFF",
  gold: "#F8CC82",
  gray: "#a18100",
  blueish_gray: "#FFFFFF",
  textHighlightColor: "#e0e0e0", // "#F4D092",
  backgroundColor: "rgb(82,82,82)",
  // background:
  // "radial-gradient(circle at 25% 0%, rgba(227,255,240,.5), rgba(227,255,240,0) 50%), radial-gradient(circle at 80% 80%, rgba(131,165,203,.5), rgba(131,165,203,0) 50%)",
  background: "linear-gradient(287.56deg, #060606 26.12%, #141414 68.2%)",
  paperBg: "rgba(245, 194, 140, 0.45)",
  modalBg: "#FAFAFAEF",
  popoverBg: "rgba(255, 255, 255, 0.95)",
  menuBg: "rgba(255, 255, 255, 0.5)",
  backdropBg: "rgba(200, 200, 200, 0.4)",
  largeTextColor: "#759AAE",
  activeLinkColor: "#222222",
  activeLinkSvgColor: "invert(64%) sepia(11%) saturate(934%) hue-rotate(157deg) brightness(90%) contrast(86%)",
  // primaryButtonBG: "#759AAE",
  primaryButtonBG: "#ffcc54",
  primaryButtonHoverBG: "#fcb203",
  // these need fixing
  primaryButtonHoverColor: "#333333",
  secondaryButtonHoverBG: "rgba(54, 56, 64, 1)",
  outlinedPrimaryButtonHoverBG: "#F8CC82",
  outlinedPrimaryButtonHoverColor: "#333333",
  outlinedSecondaryButtonHoverBG: "#FCFCFC",
  outlinedSecondaryButtonHoverColor: "#333333",
  containedSecondaryButtonHoverBG: "#33333333",
  graphStrokeColor: "rgba(37, 52, 73, .2)",
};

export const light = responsiveFontSizes(
  createTheme(
    {
      primary: {
        main: lightTheme.color,
      },
      palette: {
        type: "light",
        background: {
          default: lightTheme.backgroundColor,
          paper: lightTheme.paperBg,
        },
        contrastText: lightTheme.color,
        primary: {
          main: lightTheme.color,
        },
        neutral: {
          main: lightTheme.color,
          secondary: lightTheme.gray,
        },
        text: {
          primary: lightTheme.color,
          secondary: lightTheme.blueish_gray,
        },
        graphStrokeColor: lightTheme.graphStrokeColor,
      },
      typography: {
        fontFamily: "Square",
      },
      props: {
        MuiSvgIcon: {
          htmlColor: lightTheme.color,
        },
      },
      overrides: {
        MuiCssBaseline: {
          "@global": {
            "@font-face": fonts,
            body: {
              background: lightTheme.background,
            },
          },
        },
        MuiPaper: {
          root: {
            background: "linear-gradient(356.1deg, #8D531F 0%, #FACB99 100%)",
            "&.ohm-card": {
              background: "transparent",
              border: "3px solid #e8b580",
              borderRadius: "32px",
            },
            "&.ohm-modal": {
              background: "rgb(0,0,0)",
            },
            "&.ohm-menu": {
              backgroundColor: lightTheme.menuBg,
            },
            "&.ohm-popover": {
              backgroundColor: "#000000",
              color: lightTheme.color,
              backdropFilter: "blur(15px)",
            },
          },
        },
        MuiDrawer: {
          paper: {
            backgroundColor: lightTheme.backdropBg,
            zIndex: 7,
          },
        },
        MuiBackdrop: {
          root: {
            backgroundColor: "rgba(255,255,255, 0)",
          },
        },
        MuiLink: {
          root: {
            color: lightTheme.color,
            "&:hover": {
              color: lightTheme.textHighlightColor,
              textDecoration: "none",
              "&.active": {
                color: lightTheme.color,
              },
            },
            "&.active": {
              color: lightTheme.color,
              textDecoration: "underline",
            },
            "@media (hover:none)": {
              "&:hover": {
                color: lightTheme.textHighlightColor,
                textDecoration: "none",
                backgroundColor: "#00000000 !important",
              },
              "&:focus": {
                color: lightTheme.textHighlightColor,
                backgroundColor: "#00000000 !important",
              },
            },
          },
        },
        MuiTableCell: {
          root: {
            color: lightTheme.color,
          },
        },
        MuiInputBase: {
          root: {
            color: lightTheme.color,
          },
        },
        MuiOutlinedInput: {
          notchedOutline: {
            borderColor: `${lightTheme.color} !important`,
            "&:hover": {
              borderColor: `${lightTheme.color} !important`,
            },
          },
        },
        MuiTab: {
          textColorPrimary: {
            color: lightTheme.blueish_gray,
            "&$selected": {
              color: lightTheme.color,
            },
          },
        },
        PrivateTabIndicator: {
          colorPrimary: {
            backgroundColor: lightTheme.color,
          },
        },
        MuiToggleButton: {
          root: {
            backgroundColor: "lightTheme.paperBg",
            "&:hover": {
              color: lightTheme.color,
              backgroundColor: lightTheme.containedSecondaryButtonHoverBG,
            },
            selected: {
              backgroundColor: lightTheme.containedSecondaryButtonHoverBG,
            },
            "@media (hover:none)": {
              "&:hover": {
                color: lightTheme.color,
                backgroundColor: lightTheme.paperBg,
              },
              "&:focus": {
                color: lightTheme.color,
                backgroundColor: lightTheme.paperBg,
              },
            },
          },
        },
        MuiIconButton: {
          root: {
            "&:hover": {
              backgroundColor: lightTheme.containedSecondaryButtonHoverBG,
            },
            "@media (hover:none)": {
              "&:hover": {
                color: lightTheme.color,
                backgroundColor: lightTheme.containedSecondaryButtonHoverBG,
              },
              "&:focus": {
                color: lightTheme.color,
                backgroundColor: lightTheme.containedSecondaryButtonHoverBG,
              },
            },
          },
        },
        MuiButton: {
          containedPrimary: {
            color: "#FFFFFF",
            background: "linear-gradient(316.29deg, #9C622E 22.96%, #FACB99 75.17%)",
            border: "1px solid #000000",
            boxSizing: "border-box",
            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
            borderRadius: "5px",
            "&:hover": {
              background: "linear-gradient(316.29deg, #8c5829 22.96%, #e0b689 75.17%)",
              color: "#FFFFFF",
            },
            "@media (hover:none)": {
              color: "#FFFFFF",
              background: "linear-gradient(316.29deg, #9C622E 22.96%, #FACB99 75.17%)",
              border: "1px solid #000000",
              boxSizing: "border-box",
              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
              borderRadius: "5px",
              "&:hover": {
                background: "linear-gradient(316.29deg, #9C622E 22.96%, #FACB99 75.17%)",
                color: "#FFFFFF",
              },
            },
          },
          containedSecondary: {
            color: "#FFFFFF",
            background: "linear-gradient(316.29deg, #9C622E 22.96%, #FACB99 75.17%)",
            border: "1px solid #000000",
            boxSizing: "border-box",
            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
            borderRadius: "5px",
            "&:hover": {
              background: "linear-gradient(316.29deg, #8c5829 22.96%, #e0b689 75.17%)",
              color: "#FFFFFF",
            },
            "@media (hover:none)": {
              color: "#FFFFFF",
              background: "linear-gradient(316.29deg, #9C622E 22.96%, #FACB99 75.17%)",
              border: "1px solid #000000",
              boxSizing: "border-box",
              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
              borderRadius: "5px",
              "&:hover": {
                background: "linear-gradient(316.29deg, #9C622E 22.96%, #FACB99 75.17%)",
                color: "#FFFFFF",
              },
            },
          },
          outlinedPrimary: {
            color: "#FFFFFF",
            background: "transparent",
            border: "2px solid #e8b580",
            borderRadius: "8px",
            "&:disabled": {
              color: "#454545",
              background: "transparent",
              border: "2px solid #454545",
              borderRadius: "8px",
            },
            "&:hover": {
              background: "transparent",
              border: "3px solid #e8b580",
              borderRadius: "8px",
            },
            "@media (hover:none)": {
              background: "transparent",
              border: "3px solid #e8b580",
              borderRadius: "8px",
              "&:hover": {
                background: "transparent",
                border: "3px solid #e8b580",
                borderRadius: "8px",
              },
            },
          },
          outlinedSecondary: {
            color: lightTheme.color,
            borderColor: lightTheme.color,
            "&:hover": {
              color: lightTheme.outlinedSecondaryButtonHoverColor,
              backgroundColor: lightTheme.outlinedSecondaryButtonHoverBG,
              borderColor: "#333333",
            },
          },
          textPrimary: {
            color: lightTheme.gray,
            "&:hover": {
              color: lightTheme.textHighlightColor,
              backgroundColor: "#00000000",
            },
            "&:active": {
              color: lightTheme.gold,
              borderBottom: "#F8CC82",
            },
          },
          textSecondary: {
            color: lightTheme.color,
            "&:hover": {
              color: lightTheme.textHighlightColor,
            },
          },
        },
      },
    },
    commonSettings,
  ),
);
