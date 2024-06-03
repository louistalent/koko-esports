import "react-native-get-random-values";
import React, { useEffect, useState } from 'react';
import { Text, View, NativeModules, Platform } from 'react-native';
import { connect } from 'react-redux';
import styles from "./styles";
import Logo from "../../../../assets/images/logo.svg";
import SocialLoginPrimary from "../../../components/auth/SocialLoginPrimary";
import SocialLoginSecondary from "../../../components/auth/SocialLoginSecondary";
import BackButton from "../../../components/BackButton";
import auth from "@react-native-firebase/auth";
import { GoogleSignin } from '@react-native-community/google-signin';
import { AnyAction, bindActionCreators, Dispatch } from 'redux';
import * as authActions from '../../../redux/actions/authActions';
import { LoginType } from '../../../consts/authConfig';
import { errorMessage } from '../../../utils/alerts';
import { appleAuth, appleAuthAndroid } from '@invertase/react-native-apple-authentication';
const { RNTwitterSignIn } = NativeModules;
import { v4 as uuid } from 'uuid';

const LoginScreen = (props: { navigation: { goBack: () => void; }; authActions: { signIn: (arg0: { params: { idToken: any; anonymousToken: string; type: { name: string; url: string; }; } | { idToken: string; anonymousToken: string | null; type: { name: string; url: string; }; } | { idToken: string; anonymousToken: any; type: { name: string; url: string; }; }; onSuccess: (response: any) => void; onFail: (error: any) => void; }) => void; }; }) => {

  GoogleSignin.configure({
    webClientId: '124310744417-1bfi3vm4kaidqi57gffbjik9m29dr7le.apps.googleusercontent.com',
  });

  const TwitterKeys = {
    TWITTER_COMSUMER_KEY: 'pPyy0Ui3yehqeYaaz3tYjICrl',
    TWITTER_CONSUMER_SECRET: 'enbIUT1yIgpXbX3GX1GtTJWTXZyp1flS4JcWDcEw7F8nluvQMO',
  };

  const [user, setUser] = useState();
  let authType = LoginType.Google;
  let anonymousToken: string|undefined|null = "";
  const [firebaseIdToken, setFirebaseIdToken] = useState('');

  useEffect(() => {
    return auth().onAuthStateChanged(onAuthStateChanged);
  }, []);

  const onBackPress = () => {
    props.navigation.goBack();
  }

  const onAuthStateChanged = (authUser: any) => {
    console.log("[onAuthStateChanged]", authUser);
    if (authUser !== null) {
      setUser(authUser);
      authUser.getIdToken(true).then((idToken: string) => {
        setFirebaseIdToken(idToken);
        if (idToken) {
          props.authActions.signIn({
            params: {idToken: idToken, anonymousToken: anonymousToken, type: authType},
            onSuccess: onLoginSuccess,
            onFail: onLoginFailed
          });
        }
      });
    }
  };

  const onApplePress = async () => {
    authType = LoginType.Apple;
    if (Platform.OS === 'ios') {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      if (!appleAuthRequestResponse.identityToken) {
        return;
      }

      const { identityToken, nonce } = appleAuthRequestResponse;
      anonymousToken = identityToken;
      const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);
      await auth().signInWithCredential(appleCredential);
    } else {
      const rawNonce = uuid();
      const state = uuid();
      appleAuthAndroid.configure({
        clientId: 'club.kokonats.koko.common',
        redirectUri: 'https://kokonats-dev-42730.firebaseapp.com/__/auth/handler',
        responseType: appleAuthAndroid.ResponseType.ALL,
        scope: appleAuthAndroid.Scope.ALL,
        nonce: rawNonce,
        state,
      });
      const response = await appleAuthAndroid.signIn();
      console.log("[AppleAuthAndroid]", response);
      const { id_token, nonce } = response;
      if (id_token) {
        anonymousToken = id_token;
        const appleCredential = auth.AppleAuthProvider.credential(id_token, rawNonce);
        await auth().signInWithCredential(appleCredential);
      } else {
        errorMessage({message: "Failed login"});
      }
    }
  }

  const onGooglePress = async () => {
    const isSigned = await GoogleSignin.isSignedIn();
    if (isSigned) {
      await GoogleSignin.signOut();
    }
    authType = LoginType.Google;
    const { idToken } = await GoogleSignin.signIn();
    anonymousToken = idToken;
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    await auth().signInWithCredential(googleCredential);
  }

  const onTwitterPress = async () => {
    authType = LoginType.Twitter;
    RNTwitterSignIn.init(
      TwitterKeys.TWITTER_COMSUMER_KEY,
      TwitterKeys.TWITTER_CONSUMER_SECRET,
    ).then(() =>
      console.log('Twitter SDK initialized'),
    );

    const { authToken, authTokenSecret } = await RNTwitterSignIn.logIn();
    anonymousToken = authToken;
    if (user) {
      props.authActions.signIn({
        params: {idToken: firebaseIdToken, anonymousToken: authToken, type: authType},
        onSuccess: onLoginSuccess,
        onFail: onLoginFailed
      });
    } else {
      const twitterCredential = auth.TwitterAuthProvider.credential(authToken, authTokenSecret);
      await auth().signInWithCredential(twitterCredential);
    }
  }

  const onLoginSuccess = (response: any) => {
    props.navigation.goBack();
  };

  const onLoginFailed = (error: { errorMessage: any; }) => {
    errorMessage({message: error.errorMessage});
  };

  return (
    <View style={styles.container}>
      <View style={styles.backButton}>
        <BackButton onPress={onBackPress}/>
      </View>
      <View style={{flex: 2}}/>
      <Logo width={88} height={90} />
      <Text style={styles.title}>アカウント作成</Text>
      <SocialLoginPrimary onPress={onApplePress} />
      <View style={styles.secondary}>
        <SocialLoginSecondary type={LoginType.Google} style={{marginRight: 24}} onPress={onGooglePress}/>
        <SocialLoginSecondary type={LoginType.Twitter} onPress={onTwitterPress}/>
      </View>
      <View style={{flex: 3}}/>
      <Text style={styles.footer}>登録するとプライバシーポリシーと利用規約に同意したものとみなします。</Text>
    </View>
  );
};

const mapStateToProps = (state: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => {
  return {
    authActions: bindActionCreators(authActions, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);
