import React, { useState, useEffect } from "react";
import { FlatList, Text, View } from "react-native";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import "../../../../utils/i18n";
import styles from "./styles";
import KokoLogo from "../../../../components/main/KokoLogo";
import KokoMarquee from "../../../../components/main/KokoMarquee";
import EnergyDisplay from "../../../../components/main/EnergyDisplay";
import { getEnergyBalance, getGameList } from "../../../../redux/selectors";
import StoreEnergyView from "../../../../components/main/store/StoreEnergyView";
import StoreGameItem from "../../../../components/main/store/StoreGameItem";
import * as reduxStoreActions from '../../../../redux/actions/storeActions';

interface StoreScreenProps {
  navigation?: any
  storeActions: any
  energy: any
  games: any[]
}


const StoreScreen = ({navigation, storeActions, energy, games}: StoreScreenProps) => {
  const { t } = useTranslation();

  const onEnergyPress = () => {
    navigation.navigate('StoreEnergyScreen');
  };

  const renderGameItem = (game: any) => {
    return <StoreGameItem game={game.item} onPress={() => onGameItemPress(game.item)} />;
  };

  const onGameItemPress = (game: any) => {
    storeActions.getGameItems(
      game.id
    );
    navigation.navigate('StoreGameScreen', { game: game });
  };

  const renderGameItemSeparator = () => {
    return (
      <View style={styles.gameSeparator} />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <KokoLogo />
        <View style={{ flex: 1 }} />
        <EnergyDisplay balance={energy}/>
      </View>
      <KokoMarquee style={styles.marquee} />
      <Text style={styles.title}>{t("store.energy")}</Text>
      <StoreEnergyView style={{ marginBottom: 16 }} onPress={onEnergyPress} />
      <Text style={styles.title}>{t("store.items")}</Text>
      <FlatList
        data={games}
        renderItem={renderGameItem}
        ItemSeparatorComponent={renderGameItemSeparator}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false} />
    </View>
  );
};

const mapStateToProps = (state: any) => {
  return {
    energy: getEnergyBalance(state),
    games: getGameList(state),
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    storeActions: bindActionCreators(reduxStoreActions, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StoreScreen);
