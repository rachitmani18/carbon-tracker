package com.rachit.carbontracker.repository;

import com.rachit.carbontracker.entity.Activity;
import com.rachit.carbontracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findByUser(User user);

}