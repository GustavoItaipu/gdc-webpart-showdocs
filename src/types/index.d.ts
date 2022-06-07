// declare module "*.jpg";
// declare module "*.png";
// declare module "*.jpeg";
// declare module "*.gif";


declare module '*.png' {
    import { ImageSourcePropType } from 'react-native'
  
    const content: ImageSourcePropType
  
    export default content
  }