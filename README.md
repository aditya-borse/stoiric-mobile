# Stoiric 

This is the mobile client for [Stoiric](https://stoiric.vercel.app), a minimalist daily journaling app that helps you track your goals, reflect on your day, and measure your personal growth.

## Tech Stack

*   React Native
*   Expo SDK
*   TypeScript

## To Build the App Locally

### Prerequisites

*   Node.js (LTS version recommended)
*   npm or yarn
*   Expo Go app on your mobile device (for development) or Android/iOS simulator/emulator
*   EAS CLI: `npm install -g eas-cli`

### Installation

1.  Clone the repository (or download the source code).
2.  Navigate to the project directory: `cd stoiric-mobile`
3.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

### Running the App (Development)

1.  Start the Metro bundler and development server:
    ```bash
    npm expo start
    # or
    yarn expo start
    ```
2.  This will open the Expo Dev Tools in your browser.
3.  You can then:
    *   Scan the QR code with the Expo Go app on your Android or iOS device.
    *   Run on an Android emulator/device: `npm run android` or `yarn android`
    *   Run on an iOS simulator/device (macOS only): `npm run ios` or `yarn ios`

## Building for Production (Android APK)

1.  Log in to your Expo account using the EAS CLI:
    ```bash
    eas login
    ```
2.  Start the build process for the production profile (which is configured in `eas.json` to build an APK):
    ```bash
    eas build -p android --profile production
    ```
3.  Follow the prompts from the EAS CLI. Once the build is complete, you can download the `.apk` file from the build details page provided by EAS.

## Architecture

```mermaid
---
config:
  theme: dark
  themeVariables:
    primaryColor: '#27272a'
    lineColor: '#f4f4f5'
    textColor: '#f4f4f5'
    secondaryColor: '#3f3f46'
    tertiaryColor: '#52525b'
---
flowchart LR
 subgraph subGraph0["UI Layer (Screens & Components)"]
        UI_Home["HomeScreen"]
        UI_NewDay["NewDayScreen"]
        UI_Reflect["ReflectionScreen"]
        UI_Score["ScoreScreen & TotalScoreScreen"]
        UI_Logs["LogsScreen & LogDetailScreen"]
        UI_Shared["Shared Components"]
  end
 subgraph subGraph1["Core Logic & Libraries"]
        NAV["React Navigation"]
        STATE["Component State - useState/useEffect"]
        STORAGE_UTILS["utils/dailyStorage.ts"]
        LIBS["3rd Party Libs - Calendar, Slider, etc."]
  end
 subgraph subGraph2["Mobile App (React Native / Expo)"]
    direction TB
        subGraph0
        subGraph1
  end
 subgraph subGraph3["Device Storage"]
        ASYNC_STORAGE[("AsyncStorage")]
  end
 subgraph subGraph4["External Dependencies"]
    direction TB
        QUOTE_API["Stoic Quotes API"]
        EAS["EAS Build Service"]
  end
 subgraph Output["Output"]
        APK["Standalone .apk"]
  end
    UI_Layer["UI_Layer"] -- Uses/Updates --> STATE
    UI_Layer -- Managed By --> NAV
    NAV -- Renders --> UI_Layer
    STATE -- Triggers/Reads --> STORAGE_UTILS
    UI_Shared -- Uses/Updates --> STATE
    UI_Shared -- Triggers/Reads --> STORAGE_UTILS
    STORAGE_UTILS -- Reads/Writes --> ASYNC_STORAGE
    UI_Shared -- Uses Fetch API --> QUOTE_API
    AppCode["Project Source Code"] -- Sent To --> EAS
    EAS -- Builds --> APK
    style ASYNC_STORAGE fill:#f59e0b,stroke:#333,stroke-width:2px,color:#000
    style QUOTE_API fill:#lightblue,stroke:#333,stroke-width:2px,color:#000
    style EAS fill:#lightgrey,stroke:#333,stroke-width:2px,color:#000
    style APK fill:#lightgreen,stroke:#333,stroke-width:2px,color:#000
    style UI_Layer color:#000000

```